import Product from "../models/Product.js";
import slugify from "slugify";
import { uploadToCloudinary } from "../utils/fileUpload.js";

export const createProduct = async (req, res) => {
  try {

    const { name, description, tags, category, price, colours, size, totalStock, isTrending, popularity } = req.body;
    // Handle multiple image uploads
    let images = [];
    

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
          images.push(imageUrl);
        } else {
          return res.status(400).json({ message: "Image upload failed for one or more files" });
        }
      }
    } else {
      console.log('No files received in request')
    }

    const slug = slugify(name, { lower: true });

    // Ensure size is an array - handle FormData format
    let sizeArray = [];
    if (size) {
      if (Array.isArray(size)) {
        sizeArray = size;
      } else if (typeof size === 'string') {
        sizeArray = [size];
      } else {
        sizeArray = ['md']; // default fallback
      }
    } else if (req.body['size[]']) {
      if (Array.isArray(req.body['size[]'])) {
        sizeArray = req.body['size[]'];
      } else {
        sizeArray = [req.body['size[]']];
      }
    } else {
      sizeArray = ['md']; // default fallback
    }


    // Ensure colours is an array - handle FormData format
    let coloursArray = [];
    if (colours) {
      if (Array.isArray(colours)) {
        coloursArray = colours;
      } else if (typeof colours === 'string') {
        coloursArray = [colours];
      } else {
        coloursArray = ['default']; // default fallback
      }
    } else if (req.body['colours[]']) {
      if (Array.isArray(req.body['colours[]'])) {
        coloursArray = req.body['colours[]'];
      } else {
        coloursArray = [req.body['colours[]']];
      }
    } else {
      coloursArray = ['default']; // default fallback
    }


    const product = await Product.create({
      name,
      slug,
      description,
      tags,
      category,
      price,
      colours: coloursArray, // Use processed colours array
      size: sizeArray, // Changed from size to size array
      images,
      totalStock,
      isTrending,
      popularity,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = "popularity",
      order = "desc",
      tag,
      category,
      size,
      trending,
      minPrice,
      maxPrice,
      search
    } = req.query;

    let filter = {};

    // Search in name and description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by tag
    if (tag) {
      filter.tags = { $in: [tag] };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by size
    if (size) {
      filter.size = { $in: [size] };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      appliedFilters: {
        sortBy,
        order,
        tag,
        category,
        size,
        trending,
        minPrice,
        maxPrice,
        search
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID (for admin edit)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    // Find the existing product first
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updateData = { ...req.body };
    let images = [...existingProduct.images];

    // Handle image removal if requested
    if (req.body.imagesToRemove) {
      try {
        const imagesToRemove = JSON.parse(req.body.imagesToRemove);
        if (Array.isArray(imagesToRemove)) {
          // Filter out the images that need to be removed
          const beforeCount = images.length;
          images = images.filter(img => !imagesToRemove.includes(img));
        }
      } catch (e) {
        console.error('Error parsing imagesToRemove:', e);
      }
    }

    // Handle new image uploads
    if (req.files && req.files.productImages && req.files.productImages.length > 0) {
      for (const file of req.files.productImages) {
        try {
          const imageUrl = await uploadToCloudinary(file);
          if (imageUrl) {
            images.push(imageUrl);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          return res.status(400).json({ message: `Error uploading image: ${error.message}` });
        }
      }
    }

    // Update images array
    updateData.images = images;

    // Remove temporary fields that shouldn't be saved to database
    delete updateData.imagesToRemove;

    // Handle size array properly - works for both JSON and FormData
    if (updateData.size !== undefined) {
      let sizeArray = [];
      if (Array.isArray(updateData.size)) {
        sizeArray = updateData.size;
      } else if (typeof updateData.size === 'string') {
        // Check if it's a JSON string
        try {
          const parsed = JSON.parse(updateData.size);
          sizeArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If not JSON, treat as comma-separated string
          sizeArray = updateData.size.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else if (updateData['size[]']) {
        // Handle FormData array format
        if (Array.isArray(updateData['size[]'])) {
          sizeArray = updateData['size[]'];
        } else {
          sizeArray = [updateData['size[]']];
        }
      }

      updateData.size = sizeArray;
    }

    // Handle colours array properly - works for both JSON and FormData
    if (updateData.colours !== undefined) {
      let coloursArray = [];
      if (Array.isArray(updateData.colours)) {
        coloursArray = updateData.colours;
      } else if (typeof updateData.colours === 'string') {
        // Check if it's a JSON string
        try {
          const parsed = JSON.parse(updateData.colours);
          coloursArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If not JSON, treat as comma-separated string
          coloursArray = updateData.colours.split(',').map(c => c.trim()).filter(Boolean);
        }
      } else if (updateData['colours[]']) {
        // Handle FormData array format
        if (Array.isArray(updateData['colours[]'])) {
          coloursArray = updateData['colours[]'];
        } else {
          coloursArray = [updateData['colours[]']];
        }
      }

      updateData.colours = coloursArray;
    }

    // Handle tags if it's a string (from FormData)
    if (typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        // If not JSON, treat as comma-separated string
        updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    // Update the product with new data
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Failed to update product" });
    }

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
