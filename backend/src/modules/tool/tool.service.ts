import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UpsertToolInput {
  id?: string;
  name: string;
  category: string;
  url?: string;
  description?: string;
  instructions?: string;
  iconUrl?: string;
  priority?: number;
  isActive?: boolean;
  roleIds?: string[];
  departmentIds?: string[];
}

@Injectable()
export class ToolService {
  constructor(private prisma: PrismaService) {}

  async listForUser(user: any) {
    const roleIds: string[] = (user.roles ?? []).map((r: any) => r.id);
    const departmentId = user.employee?.departmentId;
    return this.prisma.tool.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { roles: { none: {} } }, // tools with no role restriction
              { roles: { some: { id: { in: roleIds } } } },
            ],
          },
          {
            OR: [
              { departments: { none: {} } },
              departmentId
                ? { departments: { some: { id: departmentId } } }
                : { departments: { none: {} } },
            ],
          },
        ],
      },
      include: { roles: true, departments: true },
      orderBy: [{ priority: 'asc' }, { name: 'asc' }],
    });
  }

  listAll() {
    return this.prisma.tool.findMany({
      include: { roles: true, departments: true },
      orderBy: [{ priority: 'asc' }, { name: 'asc' }],
    });
  }

  async upsert(data: UpsertToolInput) {
    const base = {
      name: data.name,
      category: data.category,
      url: data.url,
      description: data.description,
      instructions: data.instructions,
      iconUrl: data.iconUrl,
      priority: data.priority ?? 0,
      isActive: data.isActive ?? true,
      roles: data.roleIds
        ? { set: data.roleIds.map((id) => ({ id })) }
        : undefined,
      departments: data.departmentIds
        ? { set: data.departmentIds.map((id) => ({ id })) }
        : undefined,
    };
    if (data.id) {
      return this.prisma.tool.update({ where: { id: data.id }, data: base });
    }
    return this.prisma.tool.create({
      data: {
        ...base,
        roles: data.roleIds
          ? { connect: data.roleIds.map((id) => ({ id })) }
          : undefined,
        departments: data.departmentIds
          ? { connect: data.departmentIds.map((id) => ({ id })) }
          : undefined,
      },
    });
  }

  async setActive(id: string, isActive: boolean) {
    const tool = await this.prisma.tool.findUnique({ where: { id } });
    if (!tool) throw new NotFoundException('Tool not found');
    return this.prisma.tool.update({ where: { id }, data: { isActive } });
  }

  async reorder(ordered: Array<{ id: string; priority: number }>) {
    await this.prisma.$transaction(
      ordered.map((t) =>
        this.prisma.tool.update({
          where: { id: t.id },
          data: { priority: t.priority },
        }),
      ),
    );
    return { count: ordered.length };
  }

  async remove(id: string) {
    return this.prisma.tool.delete({ where: { id } });
  }
}
