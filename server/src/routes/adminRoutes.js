import { Router } from "express";
import { adminLogin, getDashboardStats } from "../controllers/adminAuthController.js";
import { adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from "../controllers/adminProductController.js";
import {
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminUploadCategoryImage,
  adminListHeroSlides, adminCreateHeroSlide, adminUpdateHeroSlide, adminDeleteHeroSlide,
  adminListTestimonials, adminCreateTestimonial, adminUpdateTestimonial, adminDeleteTestimonial,
  adminListCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon,
  adminListOrders, adminUpdateOrderStatus,
} from "../controllers/adminContentController.js";
import { requireAdmin } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import {
  uploadProductImages, reorderProductImages, setPrimaryImage, deleteProductImage,
} from "../controllers/productImageController.js";
import { adminListReviews, adminModerateReview } from "../controllers/reviewController.js";
import { adminListServiceRequests, adminUpdateServiceRequest } from "../controllers/serviceRequestController.js";
import { adminListReturns, adminUpdateReturn } from "../controllers/returnController.js";
import {
  revenueOverTime, bestSellers, topCategories, monthlyChart, analyticsSummary,
} from "../controllers/analyticsController.js";
import {
  recordPurchase, adjustStock, bulkUpdateStock, lowStock, outOfStock, stockHistory,
} from "../controllers/inventoryController.js";

const router = Router();

// Public admin login (not gated)
router.post("/admin/login", adminLogin);

// Everything below requires a valid admin JWT
router.use("/admin", requireAdmin);

router.get("/admin/dashboard", getDashboardStats);

router.get("/admin/products", adminListProducts);
router.post("/admin/products", adminCreateProduct);
router.patch("/admin/products/:id", adminUpdateProduct);
router.delete("/admin/products/:id", adminDeleteProduct);

router.post("/admin/products/:id/images", upload.array("images", 8), uploadProductImages);
router.patch("/admin/products/:id/images/reorder", reorderProductImages);
router.patch("/admin/products/:id/images/:imageId/primary", setPrimaryImage);
router.delete("/admin/products/:id/images/:imageId", deleteProductImage);

router.post("/admin/categories", adminCreateCategory);
router.patch("/admin/categories/:id", adminUpdateCategory);
router.post("/admin/categories/:id/image", upload.single("image"), adminUploadCategoryImage);
router.delete("/admin/categories/:id", adminDeleteCategory);

router.get("/admin/hero-slides", adminListHeroSlides);
router.post("/admin/hero-slides", adminCreateHeroSlide);
router.patch("/admin/hero-slides/:id", adminUpdateHeroSlide);
router.delete("/admin/hero-slides/:id", adminDeleteHeroSlide);

router.get("/admin/testimonials", adminListTestimonials);
router.post("/admin/testimonials", adminCreateTestimonial);
router.patch("/admin/testimonials/:id", adminUpdateTestimonial);
router.delete("/admin/testimonials/:id", adminDeleteTestimonial);

router.get("/admin/coupons", adminListCoupons);
router.post("/admin/coupons", adminCreateCoupon);
router.patch("/admin/coupons/:id", adminUpdateCoupon);
router.delete("/admin/coupons/:id", adminDeleteCoupon);

router.get("/admin/orders", adminListOrders);
router.patch("/admin/orders/:id/status", adminUpdateOrderStatus);

router.get("/admin/reviews", adminListReviews);
router.patch("/admin/reviews/:reviewId/moderate", adminModerateReview);

router.get("/admin/service-requests", adminListServiceRequests);
router.patch("/admin/service-requests/:id", adminUpdateServiceRequest);

router.get("/admin/returns", adminListReturns);
router.patch("/admin/returns/:id", adminUpdateReturn);

router.get("/admin/analytics/revenue", revenueOverTime);
router.get("/admin/analytics/best-sellers", bestSellers);
router.get("/admin/analytics/top-categories", topCategories);
router.get("/admin/analytics/monthly", monthlyChart);
router.get("/admin/analytics/summary", analyticsSummary);

router.post("/admin/inventory/purchase", recordPurchase);
router.post("/admin/inventory/adjust", adjustStock);
router.patch("/admin/inventory/bulk", bulkUpdateStock);
router.get("/admin/inventory/low-stock", lowStock);
router.get("/admin/inventory/out-of-stock", outOfStock);
router.get("/admin/inventory/history/:productId", stockHistory);

export default router;
