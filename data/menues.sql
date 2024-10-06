-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Erstellungszeit: 30. Sep 2024 um 06:42
-- Server-Version: 8.0.35
-- PHP-Version: 7.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Datenbank: `la_mediterranea`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `menues`
--

CREATE TABLE `menues` (
  `menu_id` int NOT NULL,
  `menu_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menu_ingredients` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menu_price` float NOT NULL,
  `category_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `menues`
--

INSERT INTO `menues` (`menu_id`, `menu_name`, `menu_ingredients`, `menu_price`, `category_id`) VALUES
(1, 'Rinderfilet mit Rotweinsauce', 'Rinderfilet, Rotwein, Rinderfond, Butter, Salz, Pfeffer', 23.5, 7),
(2, 'Hähnchen-Curry mit Basmatireis', 'Hähnchenbrust, Currypaste, Kokosmilch, Gemüse, Basmatireis', 17.9, 7),
(3, 'Beef Burger', 'Rinderhackfleisch, Burgerbrötchen, Cheddar-Käse, Salat, Tomate, Zwiebel', 19.09, 7),
(4, 'Schweinefilet mit Champignon-Rahmsauce', 'Schweinefilet, Champignons, Sahne, Wein, Butter, Knoblauch', 15.7, 7),
(5, 'Lammkoteletts mit Rosmarin-Kartoffeln', 'Lammkoteletts, Kartoffeln, Rosmarin, Olivenöl, Knoblauch', 20.5, 7),
(6, 'Spaghetti Bolognese', 'Hackfleisch, Tomaten, Zwiebeln, Möhren, Sellerie, Spaghetti', 11.5, 7),
(7, 'Rinderrouladen mit Rotkohl und Klößen', 'Rinderrouladen, Rotkohl, Kartoffelklöße, Soße, Preiselbeeren', 21.3, 7),
(8, 'Hähnchensalat mit Avocado', 'Hähnchenbrust, Avocado, Salat, Tomaten, Dressing', 16.7, 7),
(9, 'Chili con Carne', 'Hackfleisch, Bohnen, Tomaten, Paprika, Chili, Reis', 12, 7),
(10, 'Pasta Carbonara', 'Spaghetti, Speck, Eier, Parmesan, Pfeffer', 12, 7),
(11, 'Gebratener Lachs mit Zitronen-Kräuter-Butter', 'Lachsfilet, Zitrone, Kräuterbutter, Salz, Pfeffer', 20.5, 8),
(12, 'Garnelenspieße mit Knoblauch und Zitrone', 'Garnelen, Knoblauch, Zitrone, Olivenöl, Salz, Pfeffer', 20.7, 8),
(13, 'Thunfischsteak mit Sesamkruste', 'Thunfischsteak, Sesam, Sojasauce, Ingwer, Honig', 19.7, 8),
(14, 'Calamari Fritti mit Aioli', 'Tintenfischringe, Mehl, Ei, Knoblauch, Zitrone, Mayonnaise', 16.9, 8),
(15, 'Forelle Müllerin Art', 'Forellenfilet, Mehl, Butter, Zitrone, Petersilie', 20.5, 8),
(16, 'Scampi in Knoblauchbutter', 'Scampi, Knoblauch, Butter, Petersilie, Weißwein', 20.5, 8),
(17, 'Lachs-Ceviche mit Avocado', 'Lachsfilet, Limettensaft, Avocado, Zwiebel, Koriander', 21, 8),
(18, 'Muscheln in Weißweinsauce', 'Miesmuscheln, Weißwein, Knoblauch, Petersilie, Sahne', 23, 8),
(19, 'Gebratene Jakobsmuscheln mit Spargel', 'Jakobsmuscheln, Spargel, Butter, Zitrone, Salz, Pfeffer', 23, 8),
(20, 'Seeteufel mit Tomaten-Oliven-Salsa', 'Seeteufel, Tomaten, Oliven, Kapern, Knoblauch, Petersilie', 21.5, 8),
(21, 'Vegetarische Gemüsepfanne', 'Paprika, Zucchini, Aubergine, Champignons, Olivenöl, Kräuter', 10.5, 9),
(22, 'Quinoa-Salat mit geröstetem Gemüse', 'Quinoa, Paprika, Zucchini, Kirschtomaten, Feta-Käse, Olivenöl', 10.5, 9),
(23, 'Spinat-Ricotta-Lasagne', 'Lasagneblätter, Spinat, Ricotta, Tomatensauce, Mozzarella', 10.5, 9),
(24, 'Gebackener Feta mit Honig und Thymian', 'Feta-Käse, Honig, Thymian, Olivenöl, Oliven', 9.5, 9),
(25, 'Gemüsecurry mit Kokosmilch', 'Gemüse nach Wahl, Kokosmilch, Currypaste, Basmatireis', 10.5, 9),
(26, 'Caprese Salat', 'Tomaten, Mozzarella, Basilikum, Olivenöl, Balsamico', 8.5, 9),
(27, 'Süßkartoffel-Quiche', 'Süßkartoffeln, Eier, Sahne, Käse, Lauch, Blätterteig', 9.5, 9),
(28, 'Ratatouille', 'Aubergine, Zucchini, Paprika, Tomaten, Knoblauch, Kräuter', 9.5, 9),
(29, 'Pilzrisotto', 'Risotto-Reis, Pilze, Gemüsebrühe, Weißwein, Parmesan', 9.5, 9),
(30, 'Gemüse-Burger mit Avocado', 'Gemüse-Patties, Burgerbrötchen, Avocado, Salat, Tomate', 9.5, 9),
(31, 'Schokoladen-Brownies', 'Schokolade, Butter, Zucker, Eier, Mehl, Nüsse', 3.5, 10),
(32, 'Apfel-Crumble mit Vanillesauce', 'Äpfel, Haferflocken, Butter, Zucker, Zimt, Vanillesauce', 3.75, 10),
(33, 'Erdbeer-Tiramisu', 'Erdbeeren, Löffelbiskuits, Mascarpone, Zucker, Kaffee, Kakao', 4, 10),
(34, 'Zitronen-Mohn-Kuchen', 'Zitrone, Mohn, Butter, Zucker, Mehl, Eier', 3.75, 10),
(35, 'Beeren-Panna Cotta', 'Beeren, Sahne, Gelatine, Zucker, Vanille', 3.75, 10),
(36, 'Bananen-Split', 'Bananen, Eis, Sahne, Schokoladensauce, Nüsse', 4.25, 10),
(37, 'Kaiserschmarrn mit Apfelmus', 'Mehl, Eier, Milch, Rosinen, Puderzucker, Apfelmus', 5, 10),
(38, 'Himbeer-Mousse', 'Himbeeren, Sahne, Zucker, Gelatine, Zitrone', 4.5, 10),
(39, 'Crêpes mit Nutella und Banane', 'Crêpes, Nutella, Bananen, Schokoladensauce', 3.5, 10),
(40, 'Vanillepudding mit Karamellsauce', 'Milch, Vanille, Zucker, Maisstärke, Karamellsauce', 3.25, 10);

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `menues`
--
ALTER TABLE `menues`
  ADD PRIMARY KEY (`menu_id`),
  ADD KEY `category_id` (`category_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `menues`
--
ALTER TABLE `menues`
  MODIFY `menu_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `menues`
--
ALTER TABLE `menues`
  ADD CONSTRAINT `menues_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);
