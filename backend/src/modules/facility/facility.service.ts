import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TicketService } from '../ticket/ticket.service';

const PHOTO_MAX = 3;
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const PHOTO_MIME = new Set(['image/png', 'image/jpeg']);

@Injectable()
export class FacilityService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private tickets: TicketService,
  ) {}

  // ---- Locations ----
  listLocations(activeOnly = true) {
    return this.prisma.facilityLocation.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: { assets: true },
      orderBy: { name: 'asc' },
    });
  }

  upsertLocation(data: {
    id?: string;
    name: string;
    type: string;
    building?: string;
    floor?: string;
    departmentId?: string;
    isActive?: boolean;
  }) {
    if (data.id) {
      return this.prisma.facilityLocation.update({
        where: { id: data.id },
        data,
      });
    }
    return this.prisma.facilityLocation.create({ data });
  }

  // ---- Assets ----
  listAssets(locationId?: string) {
    return this.prisma.facilityAsset.findMany({
      where: locationId ? { locationId } : {},
      include: { location: true },
      orderBy: { name: 'asc' },
    });
  }

  upsertAsset(data: {
    id?: string;
    name: string;
    type?: string;
    serialNumber?: string;
    purchaseDate?: string;
    status?: string;
    locationId: string;
  }) {
    const payload = {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
    };
    if (data.id) {
      return this.prisma.facilityAsset.update({ where: { id: data.id }, data: payload });
    }
    return this.prisma.facilityAsset.create({ data: payload });
  }

  // ---- Requests ----
  async createRequest(data: {
    title: string;
    description: string;
    issueType: string;
    urgency?: string;
    locationId: string;
    assetId?: string;
    reporterEmployeeId: string;
  }) {
    const location = await this.prisma.facilityLocation.findUnique({
      where: { id: data.locationId },
    });
    if (!location || !location.isActive) {
      throw new BadRequestException('Location is inactive or missing.');
    }
    return this.prisma.facilityRequest.create({ data: data as any });
  }

  listRequests(filters: { status?: string; urgency?: string; locationId?: string } = {}) {
    return this.prisma.facilityRequest.findMany({
      where: filters,
      include: { location: true, asset: true, photos: true, ticketLink: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRequest(id: string) {
    const req = await this.prisma.facilityRequest.findUnique({
      where: { id },
      include: { location: true, asset: true, photos: true, ticketLink: true },
    });
    if (!req) throw new NotFoundException('Facility request not found');
    return req;
  }

  async updateRequest(id: string, data: { status?: string; urgency?: string }) {
    return this.prisma.facilityRequest.update({ where: { id }, data });
  }

  async addPhoto(requestId: string, file: Express.Multer.File) {
    if (!PHOTO_MIME.has(file.mimetype)) {
      throw new BadRequestException('Photos must be PNG or JPG.');
    }
    if (file.size > PHOTO_MAX_BYTES) {
      throw new BadRequestException('Each photo must be 5 MB or smaller.');
    }
    const existing = await this.prisma.facilityPhoto.count({
      where: { facilityRequestId: requestId },
    });
    if (existing >= PHOTO_MAX) {
      throw new BadRequestException('Maximum 3 photos per facility request.');
    }
    const key = this.storage.buildKey(`facility/${requestId}`, file.originalname);
    await this.storage.putObject(key, file.buffer, file.mimetype);
    return this.prisma.facilityPhoto.create({
      data: {
        facilityRequestId: requestId,
        url: key,
        filename: file.originalname,
        size: file.size,
      },
    });
  }

  /** charge.docx §4.5: escalate facility request to Help Desk ticket. */
  async escalateToTicket(requestId: string, reporterEmployeeId: string) {
    const req = await this.findRequest(requestId);
    if (req.ticketLink) {
      throw new BadRequestException('Already linked to a Help Desk ticket.');
    }
    const ticket = await this.tickets.create({
      title: `[Facility] ${req.title}`,
      description: req.description,
      priority: req.urgency === 'critical' ? 'urgent' : req.urgency === 'high' ? 'high' : 'medium',
      employeeId: reporterEmployeeId,
      location: `${req.location.name}${req.location.building ? ` (${req.location.building})` : ''}`,
      facilityRequestId: requestId,
    });
    return { request: await this.findRequest(requestId), ticket };
  }
}
