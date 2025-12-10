import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository{
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}

  async create(user: Partial<User>){
    const created = new this.userModel(user);
    return created.save();
  }

  async findByEmail(email: string){
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string){
    return this.userModel.findById(id).exec();
  }

  async setRefreshToken(hashedToken: string | null, userId: string){
    return this.userModel.findByIdAndUpdate(userId, { refreshToken: hashedToken }, { new: true }).exec();
  }

  async removeRefreshToken(userId: string){
    return this.setRefreshToken(null, userId);
  }
}
