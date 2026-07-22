import { Router } from "express";
import { listProducts, getProduct, getRelated, listCategories } from "../controllers/productController.js";
import { listProductImages } from "../controllers/productImageController.js";

const router = Router();

router.get("/categories", listCategories);
router.get("/products", listProducts);
router.get("/products/:id", getProduct);
router.get("/products/:id/related", getRelated);
router.get("/products/:id/images", listProductImages);

export default router;
