import { prisma } from "../prisma";

export const getUserId = async (req: Express.Request) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id
    }
  });
  return user;
}