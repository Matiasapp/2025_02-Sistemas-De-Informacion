-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: bd_ventaropa
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `brand_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`brand_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (2,'Nike','Marca deportiva líder mundial','2025-10-22 05:04:28'),(3,'Adidas','Tres rayas, innovación deportiva','2025-10-22 05:04:28'),(4,'Zara','Moda rápida y accesible','2025-10-22 05:04:28'),(5,'H&M','Moda sostenible para todos','2025-10-22 05:04:28'),(6,'Levi\'s','Jeans icónicos desde 1853','2025-10-22 05:04:28'),(7,'Calvin Klein','Moda minimalista y elegante','2025-10-22 05:04:28'),(8,'Tommy Hilfiger','Estilo americano clásico','2025-10-22 05:04:28'),(9,'Puma','Marca deportiva alemana','2025-10-22 05:04:28'),(12,'Lacoste',NULL,'2025-11-10 22:07:07'),(13,'La Martina',NULL,'2025-11-10 22:07:34'),(14,'Basement',NULL,'2025-11-12 05:32:50');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `cart_ID` int NOT NULL AUTO_INCREMENT,
  `user_ID` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_ID`),
  KEY `user_ID` (`user_ID`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,1,'2025-11-14 06:52:38');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `cart_item_ID` int NOT NULL AUTO_INCREMENT,
  `cart_ID` int NOT NULL,
  `product_ID` int NOT NULL,
  `variant_ID` int NOT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`cart_item_ID`),
  KEY `cart_ID` (`cart_ID`),
  KEY `product_ID` (`product_ID`),
  KEY `fk_cart_items_variant` (`variant_ID`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_ID`) REFERENCES `cart` (`cart_ID`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`),
  CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`variant_ID`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (8,1,36,64,1);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `size_type` enum('letter','numeric') DEFAULT 'letter',
  PRIMARY KEY (`category_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (9,'Poleras',NULL,'letter'),(10,'Polerones / Hoodies',NULL,'letter'),(11,'Camisas / Blusas',NULL,'letter'),(12,'Tops',NULL,'letter'),(13,'Pantalones',NULL,'numeric'),(14,'Jeans',NULL,'numeric'),(15,'Shorts',NULL,'numeric'),(16,'Faldas',NULL,'numeric'),(17,'Vestidos',NULL,'letter');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colors` (
  `color_ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`color_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (1,'Negro'),(2,'Rojo'),(3,'Blanco'),(4,'Azul'),(6,'Verde'),(7,'Gris'),(8,'Marrón'),(9,'Rosa'),(10,'Amarillo'),(11,'Morado'),(12,'Naranja');
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveries`
--

DROP TABLE IF EXISTS `deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveries` (
  `delivery_ID` int NOT NULL AUTO_INCREMENT,
  `order_ID` int NOT NULL,
  `delivery_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pendiente','en camino','entregado') DEFAULT 'pendiente',
  `tracking_number` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`delivery_ID`),
  KEY `order_ID` (`order_ID`),
  CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `orders` (`order_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_ID` int NOT NULL AUTO_INCREMENT,
  `order_ID` int NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `variant_id` int DEFAULT NULL,
  PRIMARY KEY (`order_item_ID`),
  KEY `order_ID` (`order_ID`),
  KEY `fk_orderitems_variant` (`variant_id`),
  CONSTRAINT `fk_orderitems_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `orders` (`order_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (2,2,1,21990.00,58),(3,3,1,31990.00,70),(4,4,1,44990.00,64),(5,5,1,59990.00,62);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_ID` int NOT NULL AUTO_INCREMENT,
  `user_ID` int NOT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pendiente','pagado','enviado','entregado','cancelado') DEFAULT 'pendiente',
  `street` varchar(255) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `commune` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_ID`),
  KEY `user_ID` (`user_ID`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (2,1,'2025-11-14 07:02:13','pagado',NULL,NULL,NULL,NULL,'Pedido pagado via PayPal - 6K125041GP500682K'),(3,1,'2025-11-14 07:20:47','pagado','Av. José Pedro Alessandri 1242','Región Metropolitana','Ñuñoa','7800002','Dejar en porteria'),(4,1,'2025-11-14 07:29:03','pagado','Av. José Pedro Alessandri 1242','Región Metropolitana','Ñuñoa','7800002','Dejar en porteria | Pedido pagado via PayPal - 0VX01672VW986042U'),(5,1,'2025-11-17 02:55:06','pagado','Av. José Pedro Alessandri 1242','Región Metropolitana','Ñuñoa','780002','Esta es una nota adicional donde el cliente podrá dar detalles adicionales sobre la entrega | Pedido pagado via PayPal - 80J44352L4133792X');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_codes`
--

DROP TABLE IF EXISTS `password_reset_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `code` varchar(6) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_codes`
--

LOCK TABLES `password_reset_codes` WRITE;
/*!40000 ALTER TABLE `password_reset_codes` DISABLE KEYS */;
INSERT INTO `password_reset_codes` VALUES (1,'mponcep@utem.cl','213406','2025-11-12 06:31:28','2025-11-12 06:46:29',1);
/*!40000 ALTER TABLE `password_reset_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_ID` int NOT NULL AUTO_INCREMENT,
  `order_ID` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('tarjeta','transferencia','efectivo') DEFAULT 'tarjeta',
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_ID`),
  KEY `order_ID` (`order_ID`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `orders` (`order_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `color_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_main` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`image_id`),
  KEY `product_images_ibfk_1` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=282 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (98,32,4,'../frontend/public/uploads/1762826417242-231864945-w=1500,h=1500,fit=pad (1).webp',1),(99,32,4,'../frontend/public/uploads/1762826417242-741813228-w=1500,h=1500,fit=pad (2).webp',0),(100,32,4,'../frontend/public/uploads/1762826417243-877149629-w=1500,h=1500,fit=pad (3).webp',0),(101,32,4,'../frontend/public/uploads/1762826417245-277167214-w=1500,h=1500,fit=pad (4).webp',0),(102,32,4,'../frontend/public/uploads/1762826417245-731527700-w=1500,h=1500,fit=pad.webp',0),(151,31,3,'../frontend/public/uploads/1762841993075-590036909-1.avif',1),(152,31,3,'../frontend/public/uploads/1762841993085-182966706-2.avif',0),(153,31,3,'../frontend/public/uploads/1762841993094-996831212-3.avif',0),(180,31,3,'../frontend/public/uploads/1762917902196-290947114-5.avif',0),(226,31,2,'../frontend/public/uploads/1762921731192-773051614-1.avif',1),(227,31,2,'../frontend/public/uploads/1762921731192-506892267-2.avif',0),(228,31,2,'../frontend/public/uploads/1762921731192-442617441-3.avif',0),(229,31,2,'../frontend/public/uploads/1762921731192-331766205-4.avif',0),(230,33,2,'../frontend/public/uploads/1762924736262-543412766-w=1500,h=1500,fit=pad (1).webp',1),(231,33,2,'../frontend/public/uploads/1762924736265-843169484-w=1500,h=1500,fit=pad (2).webp',0),(232,33,2,'../frontend/public/uploads/1762924736265-587452744-w=1500,h=1500,fit=pad (5).webp',0),(233,33,2,'../frontend/public/uploads/1762924736266-817918726-w=1500,h=1500,fit=pad.webp',0),(238,33,4,'../frontend/public/uploads/1762924736272-996988272-w=1500,h=1500,fit=pad (3).webp',1),(239,33,4,'../frontend/public/uploads/1762924736272-724772938-w=1500,h=1500,fit=pad (4).webp',0),(240,33,4,'../frontend/public/uploads/1762924736273-804956619-w=1500,h=1500,fit=pad (6).webp',0),(241,33,4,'../frontend/public/uploads/1762924736273-566905248-w=1500,h=1500,fit=pad (7).webp',0),(242,34,4,'../frontend/public/uploads/1762925323810-814951552-w=1500,h=1500,fit=pad (1).webp',0),(243,34,4,'../frontend/public/uploads/1762925323812-655866301-w=1500,h=1500,fit=pad (2).webp',0),(244,34,4,'../frontend/public/uploads/1762925323815-959820928-w=1500,h=1500,fit=pad (3).webp',0),(245,34,4,'../frontend/public/uploads/1762925323817-580805514-w=1500,h=1500,fit=pad (8).webp',1),(246,34,4,'../frontend/public/uploads/1762925323820-411016826-w=1500,h=1500,fit=pad.webp',0),(247,35,4,'../frontend/public/uploads/1762925414235-147606474-w=1500,h=1500,fit=pad (1).webp',1),(248,35,4,'../frontend/public/uploads/1762925414236-456918266-w=1500,h=1500,fit=pad (2).webp',0),(249,35,4,'../frontend/public/uploads/1762925414237-483551999-w=1500,h=1500,fit=pad (3).webp',0),(250,35,4,'../frontend/public/uploads/1762925414238-787866446-w=1500,h=1500,fit=pad (4).webp',0),(251,35,4,'../frontend/public/uploads/1762925414238-437639804-w=1500,h=1500,fit=pad.webp',0),(252,36,10,'../frontend/public/uploads/1762925522576-788579039-w=1500,h=1500,fit=pad (1).webp',0),(253,36,10,'../frontend/public/uploads/1762925522576-547596122-w=1500,h=1500,fit=pad (2).webp',0),(254,36,10,'../frontend/public/uploads/1762925522577-255414250-w=1500,h=1500,fit=pad (5).webp',1),(255,36,10,'../frontend/public/uploads/1762925522578-683519171-w=1500,h=1500,fit=pad.webp',0),(256,37,1,'../frontend/public/uploads/1762925718237-398405030-w=1500,h=1500,fit=pad (1).webp',0),(257,37,1,'../frontend/public/uploads/1762925718237-116318382-w=1500,h=1500,fit=pad (2).webp',1),(258,37,1,'../frontend/public/uploads/1762925718238-242812666-w=1500,h=1500,fit=pad (3).webp',0),(259,37,1,'../frontend/public/uploads/1762925718241-604458538-w=1500,h=1500,fit=pad.webp',0),(260,38,1,'../frontend/public/uploads/1762925934750-369121907-w=1500,h=1500,fit=pad (1).webp',0),(261,38,1,'../frontend/public/uploads/1762925934752-658256820-w=1500,h=1500,fit=pad (2).webp',0),(262,38,1,'../frontend/public/uploads/1762925934752-615750840-w=1500,h=1500,fit=pad (4).webp',1),(263,38,1,'../frontend/public/uploads/1762925934754-661428048-w=1500,h=1500,fit=pad.webp',0),(264,38,4,'../frontend/public/uploads/1762925934754-274938756-w=1500,h=1500,fit=pad (3).webp',1),(265,38,4,'../frontend/public/uploads/1762925934755-96850630-w=1500,h=1500,fit=pad (5).webp',0),(266,38,4,'../frontend/public/uploads/1762925934756-214150001-w=1500,h=1500,fit=pad (6).webp',0),(267,39,4,'../frontend/public/uploads/1762926091325-913097117-w=1500,h=1500,fit=pad (1).webp',0),(268,39,4,'../frontend/public/uploads/1762926091325-55321791-w=1500,h=1500,fit=pad (2).webp',0),(269,39,4,'../frontend/public/uploads/1762926091325-199337462-w=1500,h=1500,fit=pad (7).webp',1),(270,39,4,'../frontend/public/uploads/1762926091325-597149330-w=1500,h=1500,fit=pad.webp',0),(271,40,1,'../frontend/public/uploads/1762926374361-544419661-w=1500,h=1500,fit=pad (1).webp',1),(272,40,1,'../frontend/public/uploads/1762926374361-250958243-w=1500,h=1500,fit=pad (2).webp',0),(273,40,1,'../frontend/public/uploads/1762926374363-894807837-w=1500,h=1500,fit=pad (3).webp',0),(274,40,1,'../frontend/public/uploads/1762926374364-687559376-w=1500,h=1500,fit=pad (4).webp',0),(275,40,1,'../frontend/public/uploads/1762926374365-519968249-w=1500,h=1500,fit=pad.webp',0),(276,40,7,'../frontend/public/uploads/1762926374366-557599513-w=1500,h=1500,fit=pad (5).webp',1),(277,40,7,'../frontend/public/uploads/1762926374366-778215742-w=1500,h=1500,fit=pad (6).webp',0),(278,40,7,'../frontend/public/uploads/1762926374367-889296253-w=1500,h=1500,fit=pad (7).webp',0),(279,40,7,'../frontend/public/uploads/1762926374368-595943896-w=1500,h=1500,fit=pad (8).webp',0),(280,40,7,'../frontend/public/uploads/1762926374369-749044987-w=1500,h=1500,fit=pad (9).webp',0),(281,31,3,'../frontend/public/uploads/1763098733185-659108845-4.avif',0);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `variant_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `size` varchar(10) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `sku` varchar(50) DEFAULT NULL,
  `color_ID` int DEFAULT NULL,
  `total_sales` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`variant_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `color_ID` (`color_ID`),
  KEY `product_variants_ibfk_1` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_ID`) ON DELETE CASCADE,
  CONSTRAINT `product_variants_ibfk_2` FOREIGN KEY (`color_ID`) REFERENCES `colors` (`color_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (50,31,'S',9900.00,4,'PUM-BLA-S',3,0,1),(51,31,'M',9900.00,7,'PUM-BLA-M',3,0,1),(52,32,'S',19990.00,32,'LEV-AZU-S',4,0,1),(53,32,'M',19990.00,52,'LEV-AZU-M',4,0,1),(54,31,'S',9900.00,4,'PUM-ROJ-S',2,0,1),(58,33,'M',21990.00,7,'PUM-ROJ-M',2,0,1),(59,33,'L',21990.00,10,'PUM-ROJ-L',2,0,1),(60,33,'S',21990.00,4,'PUM-AZU-S',4,0,1),(61,33,'M',21990.00,9,'PUM-AZU-M',4,0,1),(62,34,'M',59990.00,17,'LAM-AZU-M',4,0,1),(63,35,'XL',59990.00,5,'LAM-AZU-XL',4,0,1),(64,36,'L',44990.00,6,'LAM-AMA-L',10,0,1),(65,37,'S',24990.00,8,'BAS-NEG-S',1,0,1),(66,38,'34',29990.00,4,'BAS-NEG-34',1,0,1),(67,38,'32',29990.00,15,'BAS-AZU-32',4,0,1),(68,39,'34',62990.00,7,'LEV-AZU-34',4,0,1),(69,40,'S',35990.00,7,'ADI-NEG-S',1,0,1),(70,40,'M',31990.00,7,'ADI-GRI-M',7,0,1);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_ID` int NOT NULL AUTO_INCREMENT,
  `category_ID` int DEFAULT NULL,
  `gender` enum('Hombre','Mujer','Unisex') NOT NULL DEFAULT 'Unisex',
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `brand_id` int DEFAULT NULL,
  `main_color_ID` int DEFAULT NULL,
  `supplier_ID` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `total_sales` int DEFAULT '0',
  PRIMARY KEY (`product_ID`),
  KEY `category_ID` (`category_ID`),
  KEY `fk_brand` (`brand_id`),
  KEY `fk_supplier` (`supplier_ID`),
  CONSTRAINT `fk_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`brand_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_supplier` FOREIGN KEY (`supplier_ID`) REFERENCES `suppliers` (`supplier_ID`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_ID`) REFERENCES `categories` (`category_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (31,9,'Unisex','Polera Deportiva Logotipo Classics','Luce un estilo directo con algodón puro de la BCI. Esta polera clásica es un modelo básico de verano. Tiene un corte regular favorecedor, cuello redondo y un audaz logotipo PUMA Archive N.° 1 en el pecho.','2025-11-11 01:57:13',9,3,2,1,0),(32,9,'Unisex','Polera Manga Corta Algodón Hombre Levis','Polera Levis alta calidad y estiloComposicion: 100% Algodón\r\nCondicion del producto: Nuevo\r\nDiseno: Estampados\r\nEstilo vestuario: Casual\r\nFit poleras: Regular fit\r\nGenero: Hombre\r\nLargo de mangas: Manga corta\r\nMaterial vestuario: Algodón\r\nPais: Chile\r\nTemporada: Toda temporada\r\nTipo de cuello: Clásico\r\nTipo poleras hombre: Poleras','2025-11-11 02:00:17',6,4,2,1,0),(33,10,'Unisex','Polerón Urbano Con Gorro Hombre Puma','Eleva tu estilo urbano con el Polerón con Gorro Puma para Hombre, una prenda esencial que fusiona comodidad y diseño contemporáneo. Este hoodie deportivo, ideal para cualquier actividad, te brinda la libertad de movimiento que necesitas sin sacrificar el estilo que te define.\r\n\r\nConfeccionado con una mezcla de algodón y poliéster reciclado, este polerón no solo te ofrece una sensación suave y cálida al tacto, sino que también contribuye a un futuro más sostenible. Su tejido fleece de 280.00 G/M² te protege del frío, mientras que su tratamiento mecánico brushing y UPF aseguran durabilidad y protección contra los rayos del sol.\r\n\r\nEl diseño de este polerón Puma destaca por su corte básico y regular fit, que se adapta a tu cuerpo de manera natural. La capucha te brinda cobertura adicional en días ventosos o lluviosos, mientras que sus mangas largas te mantienen abrigado en todo momento. Sin cierres, este hoodie es fácil de poner y quitar, perfecto para un estilo de vida activo.\r\n\r\nYa sea para entrenar, relajarte en casa o salir con amigos, el Polerón Urbano con Gorro Puma es la elección ideal. Su versatilidad lo convierte en un imprescindible en tu guardarropa, combinando a la perfección con jeans, pantalones deportivos o shorts. Disponible en Falabella.com, este polerón te permite expresar tu estilo único con la calidad y el diseño que caracterizan a Puma.','2025-11-12 05:18:56',9,2,2,1,0),(34,11,'Unisex','Camisa Check Manga Larga Casual Hombre La Martina','Descubre la elegancia casual con la Camisa Check Manga Larga de La Martina, una prenda esencial para el hombre moderno que valora el estilo y la comodidad. Confeccionada en 100% algodón, esta camisa ofrece una suavidad inigualable y una transpirabilidad que te mantendrá fresco durante todo el día.\r\n\r\nSu diseño a cuadros, un clásico atemporal, se reinventa en un corte slim fit que realza la figura masculina, proporcionando un look sofisticado y actual. El cuello clásico añade un toque de distinción, perfecto para combinar con tus jeans favoritos o pantalones casuales, adaptándose a cualquier ocasión, desde una salida informal hasta una reunión de trabajo relajada.\r\n\r\nLa Martina, reconocida por su calidad y atención al detalle, ha creado esta camisa pensando en el hombre que busca prendas duraderas y versátiles. Los puños ajustables te permiten personalizar el ajuste, mientras que el tejido de fácil cuidado facilita su mantenimiento, permitiéndote disfrutar de su estilo impecable por más tiempo.\r\n\r\nEsta camisa no solo es una prenda de vestir, es una declaración de estilo. Su diseño versátil la convierte en una pieza clave de tu guardarropa, ideal para combinar con diferentes estilos y accesorios. Ya sea que la uses sola o debajo de un blazer, la Camisa Check Manga Larga de La Martina te asegura un look impecable y lleno de personalidad.','2025-11-12 05:28:43',13,4,23,1,0),(35,11,'Unisex','Camisa Manga Larga Casual Hombre La Martina','Descubre la elegancia casual y el confort superior con la Camisa Manga Larga Casual Hombre La Martina, una prenda esencial para el armario masculino moderno. Confeccionada en 100% algodón de alta calidad, esta camisa ofrece una suavidad excepcional al tacto y una durabilidad que te acompañará en todas tus aventuras.\r\n\r\nLa Martina, reconocida por su estilo sofisticado y herencia deportiva, ha creado esta camisa pensando en el hombre que valora tanto la comodidad como la imagen. Su diseño de manga larga y fit regular te proporciona libertad de movimiento y un ajuste favorecedor, ideal para cualquier ocasión, desde un día relajado en la ciudad hasta una salida casual con amigos.\r\n\r\nEsta camisa, originaria de China, destaca por su versatilidad y facilidad de combinación. Lúcela con tus jeans favoritos para un look relajado de fin de semana, o combínala con pantalones chinos para un estilo más pulido y actual. Su tejido de algodón transpirable la convierte en una opción perfecta para todas las estaciones del año.','2025-11-12 05:30:14',13,4,23,1,0),(36,9,'Unisex','Polera Manga Corta Cuello Pique Hombre La Martina','Descubre la elegancia casual con la Polera Manga Corta Cuello Piqué de La Martina, una prenda esencial en el guardarropa de todo hombre moderno. Confeccionada en 100% algodón, esta polera ofrece una suavidad y comodidad inigualables, ideal para disfrutar de un día relajado o para un evento casual donde quieras lucir impecable.\r\n\r\nEl diseño clásico de cuello piqué le da un toque de sofisticación, mientras que su corte regular fit asegura un calce cómodo y favorecedor para todo tipo de cuerpo. La Martina, reconocida por su estilo atemporal y calidad superior, ha creado esta polera pensando en el hombre que valora la comodidad sin sacrificar el estilo.\r\n\r\nEsta polera de manga corta es perfecta para combinar con tus jeans favoritos, pantalones chinos o incluso bermudas, adaptándose a cualquier ocasión. Su versatilidad la convierte en una prenda imprescindible para cualquier temporada. Ya sea para un almuerzo con amigos, una tarde de compras o una salida nocturna, esta polera te brindará un look fresco y actual.','2025-11-12 05:32:02',13,10,23,1,0),(37,17,'Unisex','Vestido Mini Basement x Paula Mekis','Vestido casual sin mangas Cuello Alto Corto 97% Poliester 3%Elastano','2025-11-12 05:35:18',14,1,23,1,0),(38,15,'Unisex','Short Mujer Basement x Paula Mekis','','2025-11-12 05:38:54',14,4,2,1,0),(39,14,'Unisex','Jeans Hombre 505 Regular Celeste Levis','Descubre los Jeans Hombre 505 Regular Celeste Levis, un verdadero ícono de la moda. Este modelo se caracteriza por su clásico corte recto y un tiro medio que garantiza un ajuste cómodo y favorecedor en la cintura. Diseñados para ofrecer espacio adicional en el muslo, son perfectos para cualquier hombre que busca estilo sin sacrificar la comodidad. La bragueta con cremallera los hace prácticos y fáciles de usar. Fabricados con una mezcla de 99% algodón y 1% elastano, su tejido de denim ligero y con stretch te permite moverte con total libertad. Ideales para el uso diario, estos jeans celestes son una pieza esencial y versátil para tu clóset. 00505-3068\r\n','2025-11-12 05:41:31',6,4,25,1,0),(40,10,'Unisex','Polerón Deportivo M 3S Ft Swt Je6372 Hombre Adidas','Eleva tu estilo deportivo con este polerón Adidas, ideal para tus entrenamientos o para un look casual y relajado. Confeccionado en tejido de felpa suave, te brinda comodidad y libertad de movimiento. Su diseño clásico con las 3 Tiras y el logo Adidas le dan un toque deportivo y moderno. Perfecto para combinar con tus jeans o pantalones deportivos favoritos.\r\n\r\nConfeccionado con materiales reciclados y renovables, contribuyendo a un futuro más sostenible.\r\nTejido de felpa suave que proporciona una sensación de confort y calidez.\r\nDiseño clásico con las 3 Tiras a lo largo de las mangas, un sello distintivo de Adidas.\r\nCorte regular que ofrece un ajuste cómodo y favorecedor.\r\nIdeal para training, actividades deportivas o para un look casual en tu día a día.\r\nEste polerón Adidas es una prenda versátil y esencial en el armario de todo hombre. ¡Consigue el tuyo y disfruta de la comodidad y el estilo que te ofrece Adidas!','2025-11-12 05:46:14',3,1,23,1,0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_ID` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(15) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`supplier_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (2,'962894833','proveedor1','proveedor1@gmail.com','2025-11-06 21:09:17'),(23,'999999999','proveedor2','proveedor2@gmail.com','2025-11-09 19:21:10'),(25,'999999999','Proveedor Jeans','Jeans@gmail.com','2025-11-10 22:12:13');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_types`
--

DROP TABLE IF EXISTS `user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_types` (
  `type_ID` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`type_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_types`
--

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;
INSERT INTO `user_types` VALUES (1,'Cliente','Cliente común'),(2,'Administrador','Privilegios de Administrador');
/*!40000 ALTER TABLE `user_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_ID` int NOT NULL AUTO_INCREMENT,
  `type_ID` int NOT NULL,
  `rut` varchar(15) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstname` varchar(20) DEFAULT NULL,
  `lastname` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `comuna` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_ID`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_type` (`type_ID`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`type_ID`) REFERENCES `user_types` (`type_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,2,'21123922-0','mponcep@utem.cl','$2b$10$OfJl87g0l.iCgm5Zn9bA3OrHnefnlnznxb/d8.ClGgVpIkPJshz7y','Matias','Ponce','962082678','2025-10-10 22:46:39','Av. José Pedro Alessandri 1242',NULL,'','Región Metropolitana','Ñuñoa'),(2,2,'211993677','arayagabriel658@gmail.com','$2b$10$yqpUHvC/Co0XJ5k2nbN9xeMFdMhSF1EaQcdkzhLRRjy8TunS75Rry','Gabriel ','Araya Lopez','948144502','2025-10-22 02:03:41',NULL,NULL,NULL,NULL,NULL),(5,1,'111111111','dlopez@gmail.com','$2b$10$qQQ23GhV0c5Uo30df/z7sugK4RjTieSpR5JxEhyMQ6aSR7Gj5a28G','Daniel','Lopez','999999999','2025-10-22 02:18:05',NULL,NULL,NULL,NULL,NULL),(6,1,'111111111','Juanjorquera@gmail.com','$2b$10$ZfGpgTOEhw2Ppi1P.HB9JudVVHBkMLqziH3H4XwUDyXOdq3QE6Ide','Juan','Jorquera','999999999','2025-10-22 02:23:36',NULL,NULL,NULL,NULL,NULL),(7,1,'12.345-6','1234@gmail.com','$2b$10$0yFheCr61k0vGjB8Mx6RDOTIi70WcJJXZFDsKRvpL7aS1wBfzkV7a','LUIS','HERRERA','123456','2025-10-22 14:37:00',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-18  2:32:46
