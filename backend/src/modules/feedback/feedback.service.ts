import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  // Survey Methods
  async createSurvey(data: any) {
    return this.prisma.survey.create({
      data: {
        title: data.title,
        description: data.description,
        questions: data.questions || [],
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAllSurveys() {
    return this.prisma.survey.findMany({
      include: { _count: { select: { responses: true } } },
    });
  }

  async findOneSurvey(id: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: { responses: true },
    });
    if (!survey) throw new NotFoundException('Survey not found');
    return survey;
  }

  async submitSurveyResponse(surveyId: string, answers: any, userId?: string) {
    return this.prisma.surveyResponse.create({
      data: {
        surveyId,
        answers,
        userId,
      },
    });
  }

  // Performance Feedback Methods
  async createPerformanceFeedback(data: any) {
    return this.prisma.performanceFeedback.create({
      data: {
        content: data.content,
        rating: data.rating,
        employeeId: data.employeeId,
        authorId: data.authorId,
      },
      include: {
        employee: { select: { fullName: true } },
        author: { select: { fullName: true } },
      },
    });
  }

  async findEmployeeFeedback(employeeId: string) {
    return this.prisma.performanceFeedback.findMany({
      where: { employeeId },
      include: {
        author: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllFeedback() {
    return this.prisma.performanceFeedback.findMany({
      include: {
        employee: { select: { fullName: true } },
        author: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
