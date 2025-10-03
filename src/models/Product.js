import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: [String], // ["tshirt", "summer", "men"]
    category: {
      type: String,
      default: "general",
    },
    price: {
      type: Number,
      required: true,
    },
    colours: {
      type: [String], // Array of colors: ["red", "blue", "green"]
      default: ["default"],
      validate: {
        validator: function(colours) {
          if (!Array.isArray(colours) || colours.length === 0) {
            return false;
          }
          // Basic color validation - can be expanded
          const validColors = ["red", "blue", "green", "black", "white", "yellow", "purple", "pink", "orange", "gray", "brown", "default"];
          return colours.every(colour => {
            const trimmedColour = colour.toString().toLowerCase().trim();
            return validColors.includes(trimmedColour) || trimmedColour === "default";
          });
        },
        message: "Invalid colour provided. Valid colours are: red, blue, green, black, white, yellow, purple, pink, orange, gray, brown, default"
      }
    },
    size: {
      type: [String], // Array of sizes: ["sm", "md", "lg", "xl"]
      default: ["md"],
      validate: {
        validator: function(sizes) {
          if (!Array.isArray(sizes) || sizes.length === 0) {
            return false;
          }
          const validSizes = ["xs", "sm", "md", "lg", "xl", "xxl"];
          return sizes.every(size => {
            const trimmedSize = size.toString().toLowerCase().trim();
            return validSizes.includes(trimmedSize);
          });
        },
        message: "Invalid size provided. Valid sizes are: xs, sm, md, lg, xl, xxl"
      }
    },
    images: [String], // Cloudinary URLs
    inStock: {
      type: Boolean,
      default: true,
    },
    totalStock: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    popularity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
