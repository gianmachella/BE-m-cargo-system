-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: global_control
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Batches`
--

DROP TABLE IF EXISTS `Batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Batches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batchNumber` varchar(255) NOT NULL,
  `shipments` json DEFAULT NULL,
  `destinationCountry` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `shipmentType` varchar(255) NOT NULL,
  `shipmentDate` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `batchNumber` (`batchNumber`),
  KEY `createdBy` (`createdBy`),
  KEY `updatedBy` (`updatedBy`),
  CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `Users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `batches_ibfk_2` FOREIGN KEY (`updatedBy`) REFERENCES `Users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Batches`
--

LOCK TABLES `Batches` WRITE;
/*!40000 ALTER TABLE `Batches` DISABLE KEYS */;
INSERT INTO `Batches` VALUES (2,'V01282025ATEST',NULL,'Venezuela','En Aduana',1,1,'2025-02-28 21:27:54','2025-02-28 21:27:54','Aéreo',NULL);
/*!40000 ALTER TABLE `Batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Clients`
--

DROP TABLE IF EXISTS `Clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Clients`
--

LOCK TABLES `Clients` WRITE;
/*!40000 ALTER TABLE `Clients` DISABLE KEYS */;
INSERT INTO `Clients` VALUES (8,'RUBENCHO','TEST','5555555555','rubenasotor@gmail.com','2025-02-28 21:25:24','2025-02-28 21:25:24');
/*!40000 ALTER TABLE `Clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Receivers`
--

DROP TABLE IF EXISTS `Receivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Receivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `clientId` int NOT NULL,
  `country` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clientId` (`clientId`),
  CONSTRAINT `Receivers_ibfk_1` FOREIGN KEY (`clientId`) REFERENCES `Clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Receivers`
--

LOCK TABLES `Receivers` WRITE;
/*!40000 ALTER TABLE `Receivers` DISABLE KEYS */;
INSERT INTO `Receivers` VALUES (11,'BENCHO','SOTO','5555555555','CALLE GUATIRE, LAS FLORES EDIF 555 PISO 555','2025-02-28 21:25:24','2025-02-28 21:25:24','MIRANDA','GUATIRE',NULL,8,'Venezuela');
/*!40000 ALTER TABLE `Receivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Shipments`
--

DROP TABLE IF EXISTS `Shipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Shipments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shipmentNumber` varchar(255) NOT NULL,
  `batchId` int DEFAULT NULL,
  `clientId` int DEFAULT NULL,
  `receiverId` int NOT NULL,
  `boxes` json NOT NULL,
  `totalWeight` float NOT NULL,
  `totalVolume` float NOT NULL,
  `totalBoxes` int NOT NULL,
  `status` varchar(255) NOT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `paymentMethod` varchar(255) NOT NULL,
  `insurance` varchar(255) NOT NULL,
  `declaredValue` float NOT NULL,
  `valuePaid` float NOT NULL,
  `insuranceVAlue` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `shipmentNumber` (`shipmentNumber`),
  KEY `createdBy` (`createdBy`),
  KEY `updatedBy` (`updatedBy`),
  KEY `batchId` (`batchId`),
  KEY `clientId` (`clientId`),
  KEY `receiverId` (`receiverId`),
  CONSTRAINT `fk_shipments_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Shipments_ibfk_181` FOREIGN KEY (`batchId`) REFERENCES `Batches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Shipments_ibfk_182` FOREIGN KEY (`clientId`) REFERENCES `Clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Shipments_ibfk_183` FOREIGN KEY (`receiverId`) REFERENCES `Receivers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Shipments`
--

LOCK TABLES `Shipments` WRITE;
/*!40000 ALTER TABLE `Shipments` DISABLE KEYS */;
INSERT INTO `Shipments` VALUES (15,'70115',2,8,11,'\"[{\\\"weight\\\":\\\"30\\\",\\\"size\\\":\\\"17X11X11 - Small\\\",\\\"volume\\\":2.84},{\\\"weight\\\":\\\"50\\\",\\\"size\\\":\\\"21X15X16 - Medium\\\",\\\"volume\\\":2.92}]\"',80,5.76,2,'recibido en almacen',1,1,'2025-02-28 21:41:36','2025-02-28 21:41:39','Zelle','si',500,200,0.00);
/*!40000 ALTER TABLE `Shipments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `createdBy` int NOT NULL,
  `updatedBy` int NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userName`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `userId_2` (`userName`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `userId_3` (`userName`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `userId_4` (`userName`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `userId_5` (`userName`),
  UNIQUE KEY `email_5` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Gian','Machella','gianmachella','c054c325dcbbfe1b997a21138bb47a971e4c55e0b6d6d50f475873ae3be5392a','gianmachellaf@gmail.com','2024-10-14 23:41:22','2024-10-14 23:41:22',1,1,'global-cargo'),(2,'Ruben','Soto','rsoto','$2a$10$tAi9.sgZfP4UyfHf6BMCvOF2TbcET633kj0cMJvt6Bp4XXXRuhCK2','machellagian@gmail.com','2025-02-15 21:34:30','2025-02-15 21:34:30',1,1,'global-cargo');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-01  4:47:45
