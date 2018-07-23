import mongoose, { Model, Document } from 'mongoose'
import { Photo } from '../../types/data'

const photoSchema = new mongoose.Schema({
  link: String,
})

photoSchema.statics = {
  getRandomPicture(total: number) {
    const random = Math.floor(Math.random() * total)
    return this.findOne().skip(random)
  },
  getTotalPictures() {
    return this.countDocuments()
  },
}

export interface IAlbum extends Document {}
export interface IAlbumModel extends Model<IAlbum> {
  getRandomPicture(total: number): Promise<Photo>
  getTotalPictures(): Promise<number>
}

const Album: IAlbumModel = mongoose.model<IAlbum, IAlbumModel>(
  'photos',
  photoSchema,
)

export default Album
