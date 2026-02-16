-- MySQL dump 10.14  Distrib 5.5.68-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: beetleadmin
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
-- Table structure for table `beer`
--

DROP TABLE IF EXISTS `beer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `beer` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `id_brewery` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `dist` text,
  `id_type_1` int(11) NOT NULL,
  `id_type_2` int(11) DEFAULT NULL,
  `id_type_3` int(11) DEFAULT NULL,
  `ABV` float DEFAULT NULL,
  `IBU` int(11) DEFAULT NULL,
  `UID` varchar(50) DEFAULT NULL,
  `rate` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_beer_brewery_ID` (`id_brewery`),
  KEY `FK_beer_type_beer_ID` (`id_type_1`),
  KEY `FK_beer_type_beer_ID_2` (`id_type_2`),
  KEY `FK_beer_type_beer_ID_3` (`id_type_3`),
  CONSTRAINT `FK_beer_brewery_ID` FOREIGN KEY (`id_brewery`) REFERENCES `brewery` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_beer_type_beer_ID` FOREIGN KEY (`id_type_1`) REFERENCES `type_beer` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_beer_type_beer_ID_2` FOREIGN KEY (`id_type_2`) REFERENCES `type_beer` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_beer_type_beer_ID_3` FOREIGN KEY (`id_type_3`) REFERENCES `type_beer` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beer`
--

LOCK TABLES `beer` WRITE;
/*!40000 ALTER TABLE `beer` DISABLE KEYS */;
INSERT INTO `beer` VALUES (1,1,'Немец','German Pils',5,NULL,NULL,4.5,NULL,NULL,NULL);
/*!40000 ALTER TABLE `beer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brewery`
--

DROP TABLE IF EXISTS `brewery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `brewery` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `UID` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brewery`
--

LOCK TABLES `brewery` WRITE;
/*!40000 ALTER TABLE `brewery` DISABLE KEYS */;
INSERT INTO `brewery` VALUES (1,'Норма','norma_brewery');
/*!40000 ALTER TABLE `brewery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `get_basebeer`
--

DROP TABLE IF EXISTS `get_basebeer`;
/*!50001 DROP VIEW IF EXISTS `get_basebeer`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `get_basebeer` (
  `beer_id` tinyint NOT NULL,
  `ibrewery_id` tinyint NOT NULL,
  `beer_name` tinyint NOT NULL,
  `beer_dist` tinyint NOT NULL,
  `beer_type_1` tinyint NOT NULL,
  `beer_type_2` tinyint NOT NULL,
  `beer_type_3` tinyint NOT NULL,
  `beer_abv` tinyint NOT NULL,
  `beer_ibu` tinyint NOT NULL,
  `beer_uid` tinyint NOT NULL,
  `beer_rate` tinyint NOT NULL,
  `brewery_name` tinyint NOT NULL,
  `brewery_uid` tinyint NOT NULL,
  `typebeer_name_1` tinyint NOT NULL,
  `typebeer_name_2` tinyint NOT NULL,
  `typebeer_name_3` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `menu_bottle`
--

DROP TABLE IF EXISTS `menu_bottle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu_bottle` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `id_shop` int(11) DEFAULT NULL,
  `id_beer` int(11) DEFAULT NULL,
  `volume` int(11) DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  `cost` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_menu_bottle_shop_ID` (`id_shop`),
  KEY `FK_menu_bottle_beer_ID` (`id_beer`),
  CONSTRAINT `FK_menu_bottle_beer_ID` FOREIGN KEY (`id_beer`) REFERENCES `beer` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_menu_bottle_shop_ID` FOREIGN KEY (`id_shop`) REFERENCES `shop` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_bottle`
--

LOCK TABLES `menu_bottle` WRITE;
/*!40000 ALTER TABLE `menu_bottle` DISABLE KEYS */;
/*!40000 ALTER TABLE `menu_bottle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_draft`
--

DROP TABLE IF EXISTS `menu_draft`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu_draft` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `id_shop` int(11) DEFAULT NULL,
  `id_beer` int(11) DEFAULT NULL,
  `num` int(11) NOT NULL,
  `id_tare` int(11) DEFAULT NULL,
  `cost` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_menu_draft_shop_ID` (`id_shop`),
  KEY `FK_menu_draft_beer_ID` (`id_beer`),
  KEY `FK_menu_draft_tare_ID` (`id_tare`),
  CONSTRAINT `FK_menu_draft_beer_ID` FOREIGN KEY (`id_beer`) REFERENCES `beer` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_menu_draft_shop_ID` FOREIGN KEY (`id_shop`) REFERENCES `shop` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_menu_draft_tare_ID` FOREIGN KEY (`id_tare`) REFERENCES `tare` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_draft`
--

LOCK TABLES `menu_draft` WRITE;
/*!40000 ALTER TABLE `menu_draft` DISABLE KEYS */;
/*!40000 ALTER TABLE `menu_draft` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase`
--

DROP TABLE IF EXISTS `purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `id_shop` int(11) DEFAULT NULL,
  `order` varchar(255) DEFAULT NULL,
  `id_beer` int(11) DEFAULT NULL,
  `id_tare` int(11) DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  `cost` int(11) DEFAULT NULL,
  `vol_bottle` varchar(50) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_purchase_shop_ID` (`id_shop`),
  KEY `FK_purchase_beer_ID` (`id_beer`),
  KEY `FK_purchase_tare_ID` (`id_tare`),
  CONSTRAINT `FK_purchase_beer_ID` FOREIGN KEY (`id_beer`) REFERENCES `beer` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_purchase_shop_ID` FOREIGN KEY (`id_shop`) REFERENCES `shop` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_purchase_tare_ID` FOREIGN KEY (`id_tare`) REFERENCES `tare` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase`
--

LOCK TABLES `purchase` WRITE;
/*!40000 ALTER TABLE `purchase` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shop`
--

DROP TABLE IF EXISTS `shop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shop` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `is_need_ship` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop`
--

LOCK TABLES `shop` WRITE;
/*!40000 ALTER TABLE `shop` DISABLE KEYS */;
/*!40000 ALTER TABLE `shop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tare`
--

DROP TABLE IF EXISTS `tare`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tare` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `id_shop` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `formula` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_tare_shop_ID` (`id_shop`),
  CONSTRAINT `FK_tare_shop_ID` FOREIGN KEY (`id_shop`) REFERENCES `shop` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tare`
--

LOCK TABLES `tare` WRITE;
/*!40000 ALTER TABLE `tare` DISABLE KEYS */;
/*!40000 ALTER TABLE `tare` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `type_beer`
--

DROP TABLE IF EXISTS `type_beer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `type_beer` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `type_beer`
--

LOCK TABLES `type_beer` WRITE;
/*!40000 ALTER TABLE `type_beer` DISABLE KEYS */;
INSERT INTO `type_beer` VALUES (1,'APA/IPA/DIPA'),(2,'стаут/портер'),(3,'крепче 10%'),(4,'фруктовое/ягодное'),(5,'классика'),(6,'сидр'),(7,'особое'),(8,'sour ale/gose'),(9,'пшеничное'),(10,'томатное/суп'),(11,'медовуха'),(12,'иностранное'),(13,'смузи'),(14,'безалкогольное'),(15,'бельгия'),(16,'wild ale'),(17,'европейская классика'),(18,'исторические'),(19,'лимонад');
/*!40000 ALTER TABLE `type_beer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `get_basebeer`
--

/*!50001 DROP TABLE IF EXISTS `get_basebeer`*/;
/*!50001 DROP VIEW IF EXISTS `get_basebeer`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`craft`@`38.180.157.198` SQL SECURITY INVOKER */
/*!50001 VIEW `get_basebeer` AS select `beer`.`ID` AS `beer_id`,`beer`.`id_brewery` AS `ibrewery_id`,`beer`.`name` AS `beer_name`,`beer`.`dist` AS `beer_dist`,`beer`.`id_type_1` AS `beer_type_1`,`beer`.`id_type_2` AS `beer_type_2`,`beer`.`id_type_3` AS `beer_type_3`,`beer`.`ABV` AS `beer_abv`,`beer`.`IBU` AS `beer_ibu`,`beer`.`UID` AS `beer_uid`,`beer`.`rate` AS `beer_rate`,`brewery`.`name` AS `brewery_name`,`brewery`.`UID` AS `brewery_uid`,`type_beer`.`name` AS `typebeer_name_1`,`type_beer_1`.`name` AS `typebeer_name_2`,`type_beer_2`.`name` AS `typebeer_name_3` from ((((`beer` left join `brewery` on((`beer`.`id_brewery` = `brewery`.`ID`))) left join `type_beer` on((`beer`.`id_type_1` = `type_beer`.`ID`))) left join `type_beer` `type_beer_1` on((`beer`.`id_type_2` = `type_beer_1`.`ID`))) left join `type_beer` `type_beer_2` on((`beer`.`id_type_3` = `type_beer_2`.`ID`))) order by `brewery`.`name`,`beer`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-16 17:01:44
