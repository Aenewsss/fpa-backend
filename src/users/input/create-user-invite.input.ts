import { UserRoleEnum } from "src/common/enums/role.enum";

export interface CreateUserFromInviteInput {
    firstName: string
    lastName: string
    email: string;
    password: string;
    role: UserRoleEnum;
}