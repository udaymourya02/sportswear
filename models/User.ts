import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "user" | "admin"
  addresses: {
    type: "shipping" | "billing"
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    isDefault: boolean
  }[]
  preferences: {
    favoriteCategories: string[]
    recentlyViewed: {
      productId: mongoose.Types.ObjectId
      name: string
      viewedAt: Date
    }[]
    bodyType: string
    gender: string
    activityLevel: string
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [
      {
        type: { type: String, enum: ["shipping", "billing"], required: true },
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        isDefault: Boolean,
      },
    ],
    preferences: {
      favoriteCategories: [String],
      recentlyViewed: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          name: String,
          viewedAt: Date,
        },
      ],
      bodyType: String,
      gender: String,
      activityLevel: String,
    },
  },
  { timestamps: true },
)

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

