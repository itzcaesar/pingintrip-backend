import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    Request,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { PaginationDto } from '../common/dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Current user endpoints - must be before :id routes
    @Get('me')
    getMe(@Request() req: any) {
        return this.usersService.findOne(req.user.id);
    }

    @Patch('me')
    updateMe(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
        console.log('UpdateMe req.user:', req.user);
        // Prevent non-admins from changing their own role
        if (req.user.role !== Role.ADMIN) {
            delete updateUserDto.role;
        }
        return this.usersService.update(req.user.id, updateUserDto);
    }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll(@Query() paginationDto: PaginationDto) {
        return this.usersService.findAll(paginationDto);
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Patch(':id/activate')
    @Roles(Role.ADMIN)
    activate(@Param('id') id: string) {
        return this.usersService.activate(id);
    }
}
