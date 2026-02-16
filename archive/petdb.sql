-- MySQL dump 10.14  Distrib 5.5.68-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: petdb
-- ------------------------------------------------------
-- Server version	5.5.68-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `action`
--

DROP TABLE IF EXISTS `action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `action` (
  `user_name` varchar(20) NOT NULL,
  `last_action` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action`
--

LOCK TABLES `action` WRITE;
/*!40000 ALTER TABLE `action` DISABLE KEYS */;
INSERT INTO `action` VALUES ('Elena Albytova','order_new_amount|68|bottle_05'),('Tома Ильяшенко','beetlecraft');
/*!40000 ALTER TABLE `action` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractor`
--

DROP TABLE IF EXISTS `contractor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contractor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '0',
  `entity` varchar(50) DEFAULT NULL,
  `contact_name` varchar(20) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `id_place` int(11) NOT NULL,
  `address` varchar(50) DEFAULT NULL,
  `type_pay` enum('нал','безнал') DEFAULT NULL,
  `is_deferment` enum('1','0') NOT NULL DEFAULT '0',
  `is_relevant` enum('1','0') NOT NULL DEFAULT '0',
  `last_order` date DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `operating_mode` varchar(255) DEFAULT NULL,
  UNIQUE KEY `UK_contractor_id` (`id`),
  KEY `Индекс 1` (`id`),
  KEY `FK_contractor_place` (`id_place`),
  CONSTRAINT `FK_contractor_place` FOREIGN KEY (`id_place`) REFERENCES `place` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractor`
--

LOCK TABLES `contractor` WRITE;
/*!40000 ALTER TABLE `contractor` DISABLE KEYS */;
INSERT INTO `contractor` VALUES (5,'BeetleCraft','ИП Албутова','Елена','89875269312',1,'Пенза, Московская 2','безнал','0','1','2023-11-17','без оплаты','с 10 до 23 часов'),(6,'Пивная Борода',NULL,NULL,NULL,1,'Пенза, Суворова 117',NULL,'0','1',NULL,NULL,NULL);
/*!40000 ALTER TABLE `contractor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contractor_cost`
--

DROP TABLE IF EXISTS `contractor_cost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contractor_cost` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_contractor` int(11) NOT NULL DEFAULT '0',
  `id_product` int(10) unsigned NOT NULL,
  `cost` float DEFAULT NULL,
  UNIQUE KEY `UK_contractor_cost_id` (`id`),
  KEY `Индекс 1` (`id`),
  KEY `FK__contractor` (`id_contractor`),
  KEY `FK_contractor_cost_product` (`id_product`),
  CONSTRAINT `FK_contractor_cost_product` FOREIGN KEY (`id_product`) REFERENCES `product` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK__contractor` FOREIGN KEY (`id_contractor`) REFERENCES `contractor` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contractor_cost`
--

LOCK TABLES `contractor_cost` WRITE;
/*!40000 ALTER TABLE `contractor_cost` DISABLE KEYS */;
INSERT INTO `contractor_cost` VALUES (1,5,1,6),(2,5,2,7),(3,5,3,8.2),(4,5,4,9),(5,6,3,9),(7,6,1,6),(8,6,2,6.5),(9,6,4,9);
/*!40000 ALTER TABLE `contractor_cost` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_contractor` int(11) NOT NULL,
  `is_exec` enum('1','0') NOT NULL DEFAULT '0',
  `is_pay` enum('1','0') NOT NULL DEFAULT '0',
  `credit` int(11) DEFAULT NULL,
  `date_ship` date DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `is_finish_create` tinyint(1) DEFAULT '0',
  `date_ship_need` date DEFAULT NULL,
  UNIQUE KEY `UK_order_id` (`id`),
  KEY `Индекс 1` (`id`),
  KEY `FK_order_contractor` (`id_contractor`),
  CONSTRAINT `FK_order_contractor` FOREIGN KEY (`id_contractor`) REFERENCES `contractor` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 AVG_ROW_LENGTH=8192;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (64,5,'1','0',NULL,'2023-11-26',NULL,1,NULL),(67,6,'0','0',NULL,'2024-01-09',NULL,0,NULL);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_amount`
--

DROP TABLE IF EXISTS `order_amount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_amount` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_order` int(11) NOT NULL DEFAULT '0',
  `id_product` int(10) unsigned NOT NULL DEFAULT '0',
  `count` int(11) DEFAULT NULL,
  `id_contractor_cost` int(11) DEFAULT NULL,
  KEY `Индекс 1` (`id`),
  KEY `FK_order_amount_product` (`id_product`),
  KEY `FK_order_amount_id_contractor_cost` (`id_contractor_cost`),
  KEY `FK__order` (`id_order`),
  CONSTRAINT `FK_order_amount_id_contractor_cost` FOREIGN KEY (`id_contractor_cost`) REFERENCES `contractor_cost` (`id`) ON DELETE NO ACTION,
  CONSTRAINT `FK_order_amount_product` FOREIGN KEY (`id_product`) REFERENCES `product` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK__order` FOREIGN KEY (`id_order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 AVG_ROW_LENGTH=3276;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_amount`
--

LOCK TABLES `order_amount` WRITE;
/*!40000 ALTER TABLE `order_amount` DISABLE KEYS */;
INSERT INTO `order_amount` VALUES (61,64,1,80,1),(62,64,3,1000,3),(63,64,2,200,2),(64,64,4,120,4);
/*!40000 ALTER TABLE `order_amount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `place`
--

DROP TABLE IF EXISTS `place`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `place` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '0',
  UNIQUE KEY `UK_place_id` (`id`),
  KEY `Индекс 1` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `place`
--

LOCK TABLES `place` WRITE;
/*!40000 ALTER TABLE `place` DISABLE KEYS */;
INSERT INTO `place` VALUES (1,'Центр'),(2,'Арбеково');
/*!40000 ALTER TABLE `place` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `dist` varchar(50) DEFAULT NULL,
  UNIQUE KEY `UK_product_id` (`id`),
  KEY `Индекс 1` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'bottle_05','0.5 литра'),(2,'bottle_10','1 литр'),(3,'bottle_15','1.5 литра'),(4,'bottle_20','2 литра'),(5,'cap','крышка');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storage`
--

DROP TABLE IF EXISTS `storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `storage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_product` int(10) unsigned NOT NULL DEFAULT '0',
  `all` int(11) DEFAULT NULL,
  `reserv` int(11) DEFAULT NULL,
  KEY `Индекс 1` (`id`),
  KEY `FK__product` (`id_product`),
  CONSTRAINT `FK__product` FOREIGN KEY (`id_product`) REFERENCES `product` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storage`
--

LOCK TABLES `storage` WRITE;
/*!40000 ALTER TABLE `storage` DISABLE KEYS */;
INSERT INTO `storage` VALUES (1,1,0,-500),(2,2,1000,230),(3,3,300,1000),(5,4,0,120);
/*!40000 ALTER TABLE `storage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task` varchar(50) NOT NULL DEFAULT '0',
  `is_exec` enum('1','0') NOT NULL DEFAULT '0',
  `is_quickly` enum('1','0') NOT NULL DEFAULT '0',
  `date_task` date DEFAULT NULL,
  KEY `Индекс 1` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` VALUES (1,'отвезти крышки','1','0','2023-11-26'),(2,'да','1','1','2023-11-26'),(3,'сохранить','1','1','2023-11-26'),(4,'добавить','1','1','2023-11-26'),(5,'отвезти документы','0','1','2023-11-26'),(6,'позвонить ивушке','1','0','2023-11-26'),(7,'qqqqqqqq','1','0','2023-11-26'),(8,'ответить ивушке','1','0','2023-11-26');
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-16 17:02:11
