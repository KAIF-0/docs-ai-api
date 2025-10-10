import { prisma } from "../config/prisma.js";


//getter setter methods for db operations
export class ChatRepository {
  async create(data) {
    return await prisma.chat.create({ data });
  }

  async findManyByUserId(userId) {
    return await prisma.chat.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateById(id, data) {
    return await prisma.chat.update({
      where: { id },
      data,
    });
  }
}

export class MessageRepository {
  async create(data) {
    return await prisma.message.create({ data });
  }

  async deleteMany(where) {
    return await prisma.message.deleteMany({ where });
  }
}

export class SubscriptionRepository {
  async create(data) {
    return await prisma.subscription.create({ data });
  }

  async findUnique(where) {
    return await prisma.subscription.findUnique({ where });
  }
}
