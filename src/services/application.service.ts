import { prisma } from "@/lib/prisma";

export async function listApplications(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { search, status, page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { company: { contains: search } },
      { position: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      orderBy: { appliedDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.jobApplication.count({ where }),
  ]);

  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getApplication(id: string) {
  return prisma.jobApplication.findUnique({ where: { id } });
}

export async function createApplication(data: {
  company: string;
  position: string;
  status?: string;
  appliedDate?: string;
  link?: string;
  notes?: string;
  location?: string;
  salaryRange?: string;
}) {
  return prisma.jobApplication.create({
    data: {
      ...data,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : new Date(),
    },
  });
}

export async function updateApplication(
  id: string,
  data: {
    company?: string;
    position?: string;
    status?: string;
    appliedDate?: string;
    link?: string;
    notes?: string;
    location?: string;
    salaryRange?: string;
  }
) {
  return prisma.jobApplication.update({
    where: { id },
    data: {
      ...data,
      ...(data.appliedDate ? { appliedDate: new Date(data.appliedDate) } : {}),
    },
  });
}

export async function deleteApplication(id: string) {
  return prisma.jobApplication.delete({ where: { id } });
}
