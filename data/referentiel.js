const referentielAliments = [
  // Enrichissement catégorie "pâtisserie" (boulangerie)
  { nom: "Tartelette aux fruits", categorie: "pâtisserie", sousCategorie: null, marque: null, kcal: 220, qn: 1, portionDefaut: "1 tartelette (90g)", unite: "g", alternatives: ["Paris-Brest", "Opéra"], typeOrigine: "boulangerie" },
  { nom: "Paris-Brest", categorie: "pâtisserie", sousCategorie: null, marque: null, kcal: 320, qn: 1, portionDefaut: "part (100g)", unite: "g", alternatives: ["Tartelette aux fruits", "Saint-Honoré"], typeOrigine: "boulangerie" },
  { nom: "Opéra", categorie: "pâtisserie", sousCategorie: null, marque: null, kcal: 350, qn: 1, portionDefaut: "part (90g)", unite: "g", alternatives: ["Paris-Brest", "Saint-Honoré"], typeOrigine: "boulangerie" },
  { nom: "Saint-Honoré", categorie: "pâtisserie", sousCategorie: null, marque: null, kcal: 340, qn: 1, portionDefaut: "part (100g)", unite: "g", alternatives: ["Opéra", "Paris-Brest"], typeOrigine: "boulangerie" },
  // Enrichissement catégorie "gâteau" (ajout 15%)
  { nom: "Gâteau au yaourt", categorie: "gâteaux", sousCategorie: null, marque: null, kcal: 250, qn: 1, portionDefaut: "part (80g)", unite: "g", alternatives: ["Quatre-quarts", "Fondant au chocolat"], typeOrigine: "maison" },
  { nom: "Fondant au chocolat", categorie: "gâteaux", sousCategorie: null, marque: null, kcal: 350, qn: 1, portionDefaut: "part (90g)", unite: "g", alternatives: ["Gâteau au yaourt", "Quatre-quarts"], typeOrigine: "maison" },
  { nom: "Quatre-quarts", categorie: "gâteaux", sousCategorie: null, marque: "Ker Cadélac", kcal: 370, qn: 1, portionDefaut: "tranche (40g)", unite: "g", alternatives: ["Gâteau au yaourt", "Madeleine"], typeOrigine: "industriel" },
  { nom: "Madeleine", categorie: "gâteaux", sousCategorie: null, marque: "St Michel", kcal: 130, qn: 1, portionDefaut: "1 madeleine (25g)", unite: "g", alternatives: ["Quatre-quarts", "Gâteau au yaourt"], typeOrigine: "industriel" },
  // Catégories ajoutées explicitement pour futurs enregistrements (structure, à enrichir)
  { nom: "Exemple gâteau", categorie: "gâteaux", sousCategorie: null, marque: null, kcal: null, qn: null, portionDefaut: null, unite: null, alternatives: [], typeOrigine: null },
  { nom: "Exemple pâtisserie", categorie: "pâtisserie", sousCategorie: null, marque: null, kcal: null, qn: null, portionDefaut: null, unite: null, alternatives: [], typeOrigine: null },
  { nom: "Exemple céréales", categorie: "céréales", sousCategorie: null, marque: null, kcal: null, qn: null, portionDefaut: null, unite: null, alternatives: [], typeOrigine: null },
  { nom: "Exemple charcuterie", categorie: "charcuterie", sousCategorie: null, marque: null, kcal: null, qn: null, portionDefaut: null, unite: null, alternatives: [], typeOrigine: null },
  { nom: "Exemple poisson", categorie: "poisson", sousCategorie: null, marque: null, kcal: null, qn: null, portionDefaut: null, unite: null, alternatives: [], typeOrigine: null },
            // Bonbons et confiseries
            { nom: "Maltesers", categorie: "confiserie", sousCategorie: "Chocolat", marque: "Maltesers", kcal: 150, qn: 1, portionDefaut: "25g", unite: "g", alternatives: ["M&M’s", "Smarties"] },
            { nom: "M&M’s", categorie: "confiserie", sousCategorie: "Chocolat", marque: "M&M’s", kcal: 140, qn: 1, portionDefaut: "25g", unite: "g", alternatives: ["Maltesers", "Smarties"] },
            { nom: "Smarties", categorie: "confiserie", sousCategorie: "Chocolat", marque: "Smarties", kcal: 135, qn: 1, portionDefaut: "25g", unite: "g", alternatives: ["M&M’s", "Maltesers"] },
            { nom: "Dragibus Haribo", categorie: "confiserie", sousCategorie: "Bonbon gélifié", marque: "Haribo", kcal: 90, qn: 1, portionDefaut: "20g", unite: "g", alternatives: ["Tagada Haribo", "Carambar"] },
            { nom: "Tagada Haribo", categorie: "confiserie", sousCategorie: "Bonbon gélifié", marque: "Haribo", kcal: 85, qn: 1, portionDefaut: "20g", unite: "g", alternatives: ["Dragibus Haribo", "Carambar"] },
            { nom: "Carambar", categorie: "confiserie", sousCategorie: "Caramel", marque: "Carambar", kcal: 40, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Dragibus Haribo", "Tagada Haribo"] },
            { nom: "Fraise Pik Haribo", categorie: "confiserie", sousCategorie: "Bonbon acidulé", marque: "Haribo", kcal: 80, qn: 1, portionDefaut: "20g", unite: "g", alternatives: ["Dragibus Haribo", "Tagada Haribo"] },
            { nom: "Bonbons gélifiés", categorie: "confiserie", sousCategorie: "Bonbon gélifié", marque: null, kcal: 90, qn: 1, portionDefaut: "20g", unite: "g", alternatives: ["Dragibus Haribo", "Tagada Haribo"] },
            { nom: "Sucette Chupa Chups", categorie: "confiserie", sousCategorie: "Sucette", marque: "Chupa Chups", kcal: 45, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Carambar", "Bonbons gélifiés"] },
            { nom: "Bonbons acidulés", categorie: "confiserie", sousCategorie: "Bonbon acidulé", marque: null, kcal: 85, qn: 1, portionDefaut: "20g", unite: "g", alternatives: ["Fraise Pik Haribo", "Dragibus Haribo"] },
            { nom: "Bonbons réglisse", categorie: "confiserie", sousCategorie: "Bonbon réglisse", marque: null, kcal: 80, qn: 1, portionDefaut: "20g", unite: "g", alternatives: ["Bonbons gélifiés", "Carambar"] },
            { nom: "Bonbons menthe", categorie: "confiserie", sousCategorie: "Bonbon menthe", marque: null, kcal: 70, qn: 1, portionDefaut: "20g", unite: "g", alternatives: ["Bonbons gélifiés", "Bonbons réglisse"] },
          // Brochettes japonaises (Yakitori)
          { nom: "Yakitori poulet", categorie: "asiatique", sousCategorie: "Brochette japonaise", marque: null, kcal: 80, qn: 2, portionDefaut: "1 brochette", unite: "piece", alternatives: ["Yakitori bœuf", "Yakitori fromage"] },
          { nom: "Yakitori bœuf", categorie: "asiatique", sousCategorie: "Brochette japonaise", marque: null, kcal: 90, qn: 2, portionDefaut: "1 brochette", unite: "piece", alternatives: ["Yakitori poulet", "Yakitori fromage"] },
          { nom: "Yakitori fromage", categorie: "asiatique", sousCategorie: "Brochette japonaise", marque: null, kcal: 110, qn: 3, portionDefaut: "1 brochette", unite: "piece", alternatives: ["Yakitori poulet", "Yakitori légumes"] },
          { nom: "Yakitori légumes", categorie: "asiatique", sousCategorie: "Brochette japonaise", marque: null, kcal: 60, qn: 2, portionDefaut: "1 brochette", unite: "piece", alternatives: ["Yakitori poulet", "Yakitori crevette"] },
          { nom: "Yakitori crevette", categorie: "asiatique", sousCategorie: "Brochette japonaise", marque: null, kcal: 70, qn: 2, portionDefaut: "1 brochette", unite: "piece", alternatives: ["Yakitori légumes", "Yakitori saumon"] },
          { nom: "Yakitori saumon", categorie: "asiatique", sousCategorie: "Brochette japonaise", marque: null, kcal: 85, qn: 2, portionDefaut: "1 brochette", unite: "piece", alternatives: ["Yakitori crevette", "Yakitori poulet"] },
          { nom: "Yakitori porc", categorie: "asiatique", sousCategorie: "Brochette japonaise", marque: null, kcal: 95, qn: 2, portionDefaut: "1 brochette", unite: "piece", alternatives: ["Yakitori poulet", "Yakitori bœuf"] },
          { nom: "Yakitori tsukune (boulette)", categorie: "asiatique", sousCategorie: "Brochette japonaise", marque: null, kcal: 100, qn: 3, portionDefaut: "1 brochette", unite: "piece", alternatives: ["Yakitori poulet", "Yakitori bœuf"] },
          // Batch 1 - Grande surface France (plats industriels)
          { nom: "Hachis Parmentier (industriel, surgelé Picard)", categorie: "plat préparé", sousCategorie: "surgelé", marque: "Picard", kcal: 120, qn: 1, portionDefaut: "barquette", unite: "barquette", typeOrigine: "industriel", alternatives: ["Hachis Parmentier (maison)", "Parmentier de poisson"] },
          { nom: "Lasagnes bolognaise (industriel, Fleury Michon)", categorie: "plat préparé", sousCategorie: "frais", marque: "Fleury Michon", kcal: 135, qn: 1, portionDefaut: "barquette", unite: "barquette", typeOrigine: "industriel", alternatives: ["Lasagnes bolognaise (maison)", "Moussaka"] },
          { nom: "Gratin dauphinois (industriel, Marie)", categorie: "plat préparé", sousCategorie: "frais", marque: "Marie", kcal: 110, qn: 2, portionDefaut: "barquette", unite: "barquette", typeOrigine: "industriel", alternatives: ["Gratin dauphinois (maison)", "Gratin de légumes"] },
          { nom: "Couscous royal (industriel, William Saurin)", categorie: "plat préparé", sousCategorie: "conserve", marque: "William Saurin", kcal: 140, qn: 1, portionDefaut: "boîte", unite: "boîte", typeOrigine: "industriel", alternatives: ["Couscous royal (maison)", "Tajine"] },
          { nom: "Cassoulet (conserve, William Saurin)", categorie: "plat préparé", sousCategorie: "conserve", marque: "William Saurin", kcal: 160, qn: 1, portionDefaut: "boîte", unite: "boîte", typeOrigine: "industriel", alternatives: ["Cassoulet (maison)", "Petit salé aux lentilles"] },
          { nom: "Pizza 4 fromages (surgelée, Buitoni)", categorie: "plat préparé", sousCategorie: "surgelé", marque: "Buitoni", kcal: 220, qn: 2, portionDefaut: "pizza", unite: "pizza", typeOrigine: "industriel", alternatives: ["Pizza 4 fromages (maison)", "Pizza reine"] },
          { nom: "Poêlée campagnarde (surgelée, Findus)", categorie: "plat préparé", sousCategorie: "surgelé", marque: "Findus", kcal: 90, qn: 2, portionDefaut: "poêlée", unite: "poêlée", typeOrigine: "industriel", alternatives: ["Poêlée de légumes maison", "Poêlée asiatique"] },
          { nom: "Nuggets de poulet (surgelés, Carrefour)", categorie: "plat préparé", sousCategorie: "surgelé", marque: "Carrefour", kcal: 210, qn: 1, portionDefaut: "6 pièces", unite: "piece", typeOrigine: "industriel", alternatives: ["Nuggets de poulet (maison)", "Tenders de poulet"] },
          { nom: "Poisson pané (surgelé, Findus)", categorie: "plat préparé", sousCategorie: "surgelé", marque: "Findus", kcal: 180, qn: 2, portionDefaut: "2 pièces", unite: "piece", typeOrigine: "industriel", alternatives: ["Poisson pané (maison)", "Filet de poisson"] },
          { nom: "Paëlla (industriel, Sodebo)", categorie: "plat préparé", sousCategorie: "frais", marque: "Sodebo", kcal: 150, qn: 2, portionDefaut: "barquette", unite: "barquette", typeOrigine: "industriel", alternatives: ["Paëlla (maison)", "Riz cantonais"] },
          // Batch 2 - Grande surface France (plats industriels)
          { nom: "Chili con carne (industriel, Weight Watchers)", categorie: "plat préparé", sousCategorie: "frais", marque: "Weight Watchers", kcal: 120, qn: 2, portionDefaut: "barquette", unite: "barquette", typeOrigine: "industriel", alternatives: ["Chili con carne (maison)", "Chili sin carne"] },
          { nom: "Lasagnes végétariennes (industriel, Marie)", categorie: "plat préparé", sousCategorie: "frais", marque: "Marie", kcal: 130, qn: 2, portionDefaut: "barquette", unite: "barquette", typeOrigine: "industriel", alternatives: ["Lasagnes végétariennes (maison)", "Gratin de légumes"] },
          { nom: "Galettes de légumes (industriel, Céréal Bio)", categorie: "plat préparé", sousCategorie: "frais", marque: "Céréal Bio", kcal: 110, qn: 2, portionDefaut: "2 galettes", unite: "piece", typeOrigine: "industriel", alternatives: ["Galettes de légumes (maison)", "Röstis"] },
          { nom: "Ravioli pur bœuf (conserve, Zapetti)", categorie: "plat préparé", sousCategorie: "conserve", marque: "Zapetti", kcal: 140, qn: 1, portionDefaut: "boîte", unite: "boîte", typeOrigine: "industriel", alternatives: ["Ravioli pur bœuf (maison)", "Tortellini"] },
          { nom: "Salade piémontaise (industrielle, Fleury Michon)", categorie: "salade", sousCategorie: "frais", marque: "Fleury Michon", kcal: 180, qn: 2, portionDefaut: "barquette", unite: "barquette", typeOrigine: "industriel", alternatives: ["Salade piémontaise (maison)", "Salade de pâtes"] },
          { nom: "Quiche lorraine (industrielle, Marie)", categorie: "tarte", sousCategorie: "frais", marque: "Marie", kcal: 220, qn: 2, portionDefaut: "part", unite: "part", typeOrigine: "industriel", alternatives: ["Quiche lorraine (maison)", "Tarte aux légumes"] },
          { nom: "Croque-monsieur (industriel, Sodebo)", categorie: "sandwich", sousCategorie: "frais", marque: "Sodebo", kcal: 210, qn: 2, portionDefaut: "pièce", unite: "piece", typeOrigine: "industriel", alternatives: ["Croque-monsieur (maison)", "Sandwich jambon-fromage"] },
          { nom: "Wrap poulet crudités (industriel, Sodebo)", categorie: "sandwich", sousCategorie: "frais", marque: "Sodebo", kcal: 190, qn: 2, portionDefaut: "pièce", unite: "piece", typeOrigine: "industriel", alternatives: ["Wrap poulet crudités (maison)", "Wrap végétarien"] },
          { nom: "Sandwich triangle jambon emmental (industriel, Daunat)", categorie: "sandwich", sousCategorie: "frais", marque: "Daunat", kcal: 230, qn: 1, portionDefaut: "triangle", unite: "piece", typeOrigine: "industriel", alternatives: ["Sandwich triangle jambon emmental (maison)", "Sandwich club"] },
          { nom: "Tarte aux légumes (industrielle, Marie)", categorie: "tarte", sousCategorie: "frais", marque: "Marie", kcal: 180, qn: 2, portionDefaut: "part", unite: "part", typeOrigine: "industriel", alternatives: ["Tarte aux légumes (maison)", "Quiche lorraine"] },
        // Pitaya
        { nom: "Pad Thaï poulet", categorie: "asiatique", sousCategorie: "Pitaya", marque: "Pitaya", kcal: 650, qn: 3, portionDefaut: "bol", unite: "bol", alternatives: ["Bo Bun bœuf", "Nasi Goreng"] },
        { nom: "Bo Bun bœuf", categorie: "asiatique", sousCategorie: "Pitaya", marque: "Pitaya", kcal: 600, qn: 2, portionDefaut: "bol", unite: "bol", alternatives: ["Pad Thaï poulet", "Nasi Goreng"] },
        { nom: "Nasi Goreng", categorie: "asiatique", sousCategorie: "Pitaya", marque: "Pitaya", kcal: 700, qn: 3, portionDefaut: "bol", unite: "bol", alternatives: ["Pad Thaï poulet", "Bo Bun bœuf"] },
        { nom: "Curry vert poulet", categorie: "asiatique", sousCategorie: "Pitaya", marque: "Pitaya", kcal: 550, qn: 2, portionDefaut: "bol", unite: "bol", alternatives: ["Pad Thaï poulet", "Wok légumes"] },
        { nom: "Wok légumes", categorie: "asiatique", sousCategorie: "Pitaya", marque: "Pitaya", kcal: 350, qn: 3, portionDefaut: "bol", unite: "bol", alternatives: ["Curry vert poulet", "Riz cantonais"] },
        { nom: "Riz cantonais", categorie: "asiatique", sousCategorie: "Pitaya", marque: "Pitaya", kcal: 400, qn: 2, portionDefaut: "bol", unite: "bol", alternatives: ["Nouilles sautées", "Wok légumes"] },
        { nom: "Nouilles sautées", categorie: "asiatique", sousCategorie: "Pitaya", marque: "Pitaya", kcal: 450, qn: 2, portionDefaut: "bol", unite: "bol", alternatives: ["Riz cantonais", "Pad Thaï poulet"] },

        // Subway
        { nom: "Sub Poulet Teriyaki", categorie: "fast-food", sousCategorie: "Subway", marque: "Subway", kcal: 480, qn: 2, portionDefaut: "30cm", unite: "sandwich", alternatives: ["Sub Steak & Cheese", "Sub Végétarien"] },
        { nom: "Sub Steak & Cheese", categorie: "fast-food", sousCategorie: "Subway", marque: "Subway", kcal: 600, qn: 2, portionDefaut: "30cm", unite: "sandwich", alternatives: ["Sub Poulet Teriyaki", "Sub Végétarien"] },
        { nom: "Sub Végétarien", categorie: "fast-food", sousCategorie: "Subway", marque: "Subway", kcal: 420, qn: 2, portionDefaut: "30cm", unite: "sandwich", alternatives: ["Sub Poulet Teriyaki", "Sub Steak & Cheese"] },
        { nom: "Cookie Subway", categorie: "snack", sousCategorie: "Subway", marque: "Subway", kcal: 210, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Chips Lay's Subway"] },
        { nom: "Chips Lay's Subway", categorie: "snack", sousCategorie: "Subway", marque: "Subway", kcal: 140, qn: 1, portionDefaut: "sachet", unite: "sachet", alternatives: ["Cookie Subway"] },

        // Starbucks
        { nom: "Cappuccino", categorie: "boisson", sousCategorie: "Starbucks", marque: "Starbucks", kcal: 120, qn: 2, portionDefaut: "Tall (35cl)", unite: "cl", alternatives: ["Frappuccino Caramel"] },
        { nom: "Frappuccino Caramel", categorie: "boisson", sousCategorie: "Starbucks", marque: "Starbucks", kcal: 320, qn: 1, portionDefaut: "Grande (47cl)", unite: "cl", alternatives: ["Cappuccino"] },
        { nom: "Muffin myrtille", categorie: "snack", sousCategorie: "Starbucks", marque: "Starbucks", kcal: 420, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Cookie chocolat", "Cheesecake"] },
        { nom: "Cookie chocolat", categorie: "snack", sousCategorie: "Starbucks", marque: "Starbucks", kcal: 390, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Muffin myrtille", "Cheesecake"] },
        { nom: "Cheesecake", categorie: "dessert", sousCategorie: "Starbucks", marque: "Starbucks", kcal: 350, qn: 1, portionDefaut: "part", unite: "part", alternatives: ["Cookie chocolat", "Muffin myrtille"] },

        // Class'Croute
        { nom: "Salade César", categorie: "salade", sousCategorie: "Class'Croute", marque: "Class'Croute", kcal: 350, qn: 2, portionDefaut: "barquette", unite: "barquette", alternatives: ["Wrap poulet curry"] },
        { nom: "Wrap poulet curry", categorie: "sandwich", sousCategorie: "Class'Croute", marque: "Class'Croute", kcal: 320, qn: 2, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Salade César"] },
        { nom: "Tarte tomate chèvre", categorie: "tarte", sousCategorie: "Class'Croute", marque: "Class'Croute", kcal: 280, qn: 3, portionDefaut: "part", unite: "part", alternatives: ["Brownie"] },
        { nom: "Brownie", categorie: "snack", sousCategorie: "Class'Croute", marque: "Class'Croute", kcal: 370, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Tarte tomate chèvre"] },

        // Bamboo Sushi
        { nom: "Sushi saumon Bamboo", categorie: "asiatique", sousCategorie: "Bamboo Sushi", marque: "Bamboo Sushi", kcal: 40, qn: 3, portionDefaut: "pièce", unite: "piece", alternatives: ["Maki avocat Bamboo"] },
        { nom: "Maki avocat Bamboo", categorie: "asiatique", sousCategorie: "Bamboo Sushi", marque: "Bamboo Sushi", kcal: 30, qn: 3, portionDefaut: "pièce", unite: "piece", alternatives: ["Sushi saumon Bamboo"] },
        { nom: "California crevette Bamboo", categorie: "asiatique", sousCategorie: "Bamboo Sushi", marque: "Bamboo Sushi", kcal: 45, qn: 3, portionDefaut: "pièce", unite: "piece", alternatives: ["Gyoza Bamboo"] },
        { nom: "Gyoza Bamboo", categorie: "asiatique", sousCategorie: "Bamboo Sushi", marque: "Bamboo Sushi", kcal: 60, qn: 2, portionDefaut: "pièce", unite: "piece", alternatives: ["California crevette Bamboo"] },
        { nom: "Soupe miso Bamboo", categorie: "asiatique", sousCategorie: "Bamboo Sushi", marque: "Bamboo Sushi", kcal: 60, qn: 1, portionDefaut: "bol", unite: "bol", alternatives: ["Gyoza Bamboo"] },

        // Royal Buffet Tours
        { nom: "Nems au porc Royal Buffet", categorie: "asiatique", sousCategorie: "Royal Buffet Tours", marque: "Royal Buffet Tours", kcal: 90, qn: 2, portionDefaut: "pièce", unite: "piece", alternatives: ["Samoussa Royal Buffet"] },
        { nom: "Samoussa Royal Buffet", categorie: "asiatique", sousCategorie: "Royal Buffet Tours", marque: "Royal Buffet Tours", kcal: 80, qn: 2, portionDefaut: "pièce", unite: "piece", alternatives: ["Nems au porc Royal Buffet"] },
        { nom: "Poulet caramel Royal Buffet", categorie: "asiatique", sousCategorie: "Royal Buffet Tours", marque: "Royal Buffet Tours", kcal: 180, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Riz cantonais Royal Buffet"] },
        { nom: "Riz cantonais Royal Buffet", categorie: "asiatique", sousCategorie: "Royal Buffet Tours", marque: "Royal Buffet Tours", kcal: 140, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Nouilles sautées Royal Buffet"] },
        { nom: "Nouilles sautées Royal Buffet", categorie: "asiatique", sousCategorie: "Royal Buffet Tours", marque: "Royal Buffet Tours", kcal: 150, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Riz cantonais Royal Buffet"] },
      // Snacks / Cinéma
      { nom: "Popcorn sucré", categorie: "snack", sousCategorie: "Cinéma", marque: null, kcal: 120, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Popcorn salé", "Chips", "Bonbons"] },
    // Buffet japonais
    { nom: "Sushi saumon", categorie: "asiatique", sousCategorie: "Buffet japonais", marque: null, kcal: 40, qn: 3, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Sushi thon", "Sashimi"] },
    { nom: "Sashimi thon", categorie: "asiatique", sousCategorie: "Buffet japonais", marque: null, kcal: 35, qn: 4, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Sushi saumon", "Sashimi saumon"] },
    { nom: "Maki concombre", categorie: "asiatique", sousCategorie: "Buffet japonais", marque: null, kcal: 30, qn: 3, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Maki avocat", "Maki saumon"] },
    { nom: "Tempura crevette", categorie: "asiatique", sousCategorie: "Buffet japonais", marque: null, kcal: 60, qn: 2, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Tempura légumes", "Gyoza"] },

    // Buffet coréen
    { nom: "Bibimbap", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 420, qn: 2, portionDefaut: "1 bol", unite: "bol", alternatives: ["Japchae", "Bulgogi"] },
    { nom: "Japchae", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 350, qn: 2, portionDefaut: "1 assiette", unite: "assiette", alternatives: ["Bibimbap", "Bulgogi"] },
    { nom: "Bulgogi", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 400, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Bibimbap", "Japchae"] },
    { nom: "Kimchi", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 25, qn: 4, portionDefaut: "50g", unite: "g", alternatives: ["Banchan", "Japchae"] },
    { nom: "Kimbap", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 250, qn: 3, portionDefaut: "1 rouleau", unite: "piece", alternatives: ["Sushi saumon", "Bibimbap"] },
    { nom: "MAPO Aubergine", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 180, qn: 3, portionDefaut: "200g", unite: "g", alternatives: ["Aubergine", "Tofu sauté"] },
    { nom: "Nouilles larges épicées aubergine", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 380, qn: 2, portionDefaut: "1 assiette", unite: "assiette", alternatives: ["Japchae", "MAPO Aubergine"] },
    { nom: "Jjajangmyeon", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 580, qn: 2, portionDefaut: "1 bol", unite: "bol", alternatives: ["Japchae", "Nouilles sautées"] },
    { nom: "Naengmyeon", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 420, qn: 3, portionDefaut: "1 bol", unite: "bol", alternatives: ["Japchae", "Pho"] },
    { nom: "Wontons huile pimentée", categorie: "asiatique", sousCategorie: "Buffet coréen", marque: null, kcal: 200, qn: 2, portionDefaut: "6 wontons", unite: "piece", alternatives: ["Raviolis vapeur", "Gyoza"] },

    // Jjigae (ragoûts coréens)
    { nom: "Kimchi Jjigae Ramyeon", categorie: "asiatique", sousCategorie: "Jjigae", marque: null, kcal: 480, qn: 2, portionDefaut: "1 bol", unite: "bol", alternatives: ["Kimchi", "Japchae"] },
    { nom: "Sundubu-jjigae", categorie: "asiatique", sousCategorie: "Jjigae", marque: null, kcal: 180, qn: 3, portionDefaut: "1 bol", unite: "bol", alternatives: ["Kimchi Jjigae Ramyeon", "Bibimbap"] },
    { nom: "Doenjang-jjigae", categorie: "asiatique", sousCategorie: "Jjigae", marque: null, kcal: 160, qn: 3, portionDefaut: "1 bol", unite: "bol", alternatives: ["Sundubu-jjigae", "Kimchi Jjigae Ramyeon"] },

    // Street food coréen
    { nom: "Tteokbokki", categorie: "asiatique", sousCategorie: "Street food coréen", marque: null, kcal: 280, qn: 2, portionDefaut: "150g", unite: "g", alternatives: ["Sotteok-Sotteok", "Japchae"] },
    { nom: "Gochujang Tteokbokki", categorie: "asiatique", sousCategorie: "Street food coréen", marque: null, kcal: 300, qn: 2, portionDefaut: "150g", unite: "g", alternatives: ["Tteokbokki", "Sotteok-Sotteok"] },
    { nom: "Yangnyeom Chicken", categorie: "asiatique", sousCategorie: "Street food coréen", marque: null, kcal: 320, qn: 2, portionDefaut: "150g", unite: "g", alternatives: ["Dakgalbi", "Bulgogi"] },
    { nom: "Sotteok-Sotteok", categorie: "asiatique", sousCategorie: "Street food coréen", marque: null, kcal: 240, qn: 2, portionDefaut: "1 brochette", unite: "piece", alternatives: ["Tteokbokki", "Korean Corn Dog"] },
    { nom: "Korean Corn Dog", categorie: "asiatique", sousCategorie: "Street food coréen", marque: null, kcal: 280, qn: 2, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Sotteok-Sotteok", "Hot Dog"] },

    // Banchan (accompagnements coréens)
    { nom: "Banchan légumes verts", categorie: "asiatique", sousCategorie: "Banchan", marque: null, kcal: 40, qn: 4, portionDefaut: "100g", unite: "g", alternatives: ["Kimchi", "Sigeumchi Namul"] },
    { nom: "Kkaennip", categorie: "asiatique", sousCategorie: "Banchan", marque: null, kcal: 15, qn: 4, portionDefaut: "50g", unite: "g", alternatives: ["Banchan légumes verts", "Kimchi"] },
    { nom: "Miyeok", categorie: "asiatique", sousCategorie: "Banchan", marque: null, kcal: 35, qn: 4, portionDefaut: "80g", unite: "g", alternatives: ["Banchan légumes verts", "Wakame"] },
    { nom: "Oi Kimchi", categorie: "asiatique", sousCategorie: "Banchan", marque: null, kcal: 20, qn: 4, portionDefaut: "50g", unite: "g", alternatives: ["Kimchi", "Banchan légumes verts"] },
    { nom: "Sigeumchi Namul", categorie: "asiatique", sousCategorie: "Banchan", marque: null, kcal: 35, qn: 4, portionDefaut: "80g", unite: "g", alternatives: ["Banchan légumes verts", "Miyeok"] },
    { nom: "Kongnamul", categorie: "asiatique", sousCategorie: "Banchan", marque: null, kcal: 30, qn: 4, portionDefaut: "80g", unite: "g", alternatives: ["Sigeumchi Namul", "Banchan légumes verts"] },

    // Jeon (crêpes coréennes)
    { nom: "Kimchijeon", categorie: "asiatique", sousCategorie: "Jeon", marque: null, kcal: 200, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Pajeon", "Kimchi"] },
    { nom: "Pajeon", categorie: "asiatique", sousCategorie: "Jeon", marque: null, kcal: 200, qn: 2, portionDefaut: "120g", unite: "g", alternatives: ["Kimchijeon", "Hachae jeon"] },
    { nom: "Hachae jeon", categorie: "asiatique", sousCategorie: "Jeon", marque: null, kcal: 220, qn: 2, portionDefaut: "120g", unite: "g", alternatives: ["Pajeon", "Kimchijeon"] },

    // BBQ coréen
    { nom: "Samgyeopsal", categorie: "asiatique", sousCategorie: "BBQ coréen", marque: null, kcal: 380, qn: 2, portionDefaut: "120g", unite: "g", alternatives: ["Bulgogi", "Galbi"] },
    { nom: "Galbi", categorie: "asiatique", sousCategorie: "BBQ coréen", marque: null, kcal: 420, qn: 2, portionDefaut: "150g", unite: "g", alternatives: ["Bulgogi", "Samgyeopsal"] },
    { nom: "Dakgalbi", categorie: "asiatique", sousCategorie: "BBQ coréen", marque: null, kcal: 320, qn: 2, portionDefaut: "150g", unite: "g", alternatives: ["Bulgogi", "Yangnyeom Chicken"] },

    // Buffet africain (Sénégal, Congo, Côte d’Ivoire)
    { nom: "Poulet yassa", categorie: "africain", sousCategorie: "Buffet sénégalais", marque: null, kcal: 220, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Poisson yassa", "Thieboudienne"] },
    { nom: "Thieboudienne", categorie: "africain", sousCategorie: "Buffet sénégalais", marque: null, kcal: 250, qn: 2, portionDefaut: "150g", unite: "g", alternatives: ["Poulet yassa", "Mafé"] },
    { nom: "Poisson yassa", categorie: "africain", sousCategorie: "Buffet sénégalais", marque: null, kcal: 240, qn: 3, portionDefaut: "120g", unite: "g", alternatives: ["Poulet yassa", "Thieboudienne"] },
    { nom: "Pastels", categorie: "africain", sousCategorie: "Buffet sénégalais", marque: null, kcal: 180, qn: 2, portionDefaut: "80g", unite: "g", alternatives: ["Fataya", "Nems"] },
    { nom: "Fataya", categorie: "africain", sousCategorie: "Buffet sénégalais", marque: null, kcal: 220, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Pastels", "Samoussa"] },
    { nom: "Mafé", categorie: "africain", sousCategorie: "Buffet congolais", marque: null, kcal: 300, qn: 2, portionDefaut: "150g", unite: "g", alternatives: ["Poulet yassa", "Thieboudienne"] },
    { nom: "Foufou", categorie: "africain", sousCategorie: "Buffet congolais", marque: null, kcal: 180, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Mafé", "Attiéké"] },
    { nom: "Poulet moambe", categorie: "africain", sousCategorie: "Buffet congolais", marque: null, kcal: 380, qn: 2, portionDefaut: "150g", unite: "g", alternatives: ["Mafé", "Poulet yassa"] },
    { nom: "Saka-saka", categorie: "africain", sousCategorie: "Buffet congolais", marque: null, kcal: 140, qn: 3, portionDefaut: "150g", unite: "g", alternatives: ["Foufou", "Épinards"] },
    { nom: "Attiéké", categorie: "africain", sousCategorie: "Buffet ivoirien", marque: null, kcal: 160, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Foufou", "Alloco"] },
    { nom: "Alloco", categorie: "africain", sousCategorie: "Buffet ivoirien", marque: null, kcal: 220, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Attiéké", "Foufou"] },
    { nom: "Garba", categorie: "africain", sousCategorie: "Buffet ivoirien", marque: null, kcal: 320, qn: 2, portionDefaut: "200g", unite: "g", alternatives: ["Attiéké", "Alloco"] },
    { nom: "Kedjenou", categorie: "africain", sousCategorie: "Buffet ivoirien", marque: null, kcal: 280, qn: 2, portionDefaut: "150g", unite: "g", alternatives: ["Poulet yassa", "Poulet moambe"] },
    { nom: "Placali", categorie: "africain", sousCategorie: "Buffet ivoirien", marque: null, kcal: 200, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Foufou", "Attiéké"] },

    // Maghreb (Algérie, Maroc, Tunisie)
    { nom: "Couscous royal", categorie: "africain", sousCategorie: "Maghreb", marque: null, kcal: 380, qn: 2, portionDefaut: "250g", unite: "g", alternatives: ["Tajine poulet", "Riz cantonais"] },
    { nom: "Tajine poulet citron", categorie: "africain", sousCategorie: "Maghreb", marque: null, kcal: 320, qn: 2, portionDefaut: "200g", unite: "g", alternatives: ["Couscous royal", "Poulet yassa"] },
    { nom: "Tajine agneau pruneaux", categorie: "africain", sousCategorie: "Maghreb", marque: null, kcal: 420, qn: 2, portionDefaut: "200g", unite: "g", alternatives: ["Tajine poulet", "Mafé"] },
    { nom: "Merguez", categorie: "africain", sousCategorie: "Maghreb", marque: null, kcal: 300, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Kefta", "Saucisse"] },

    // Fromages industriels
      // Batch cuisine maison française (typeOrigine: 'maison')
      { nom: "Omelette nature", categorie: "plat principal", sousCategorie: "Oeufs", marque: null, kcal: 220, qn: 2, portionDefaut: "2 œufs (120g)", unite: "g", alternatives: ["Omelette jambon-fromage", "Œufs brouillés"], typeOrigine: "maison" },
      { nom: "Omelette jambon-fromage", categorie: "plat principal", sousCategorie: "Oeufs", marque: null, kcal: 260, qn: 2, portionDefaut: "2 œufs (140g)", unite: "g", alternatives: ["Omelette nature", "Croque-monsieur"], typeOrigine: "maison" },
      { nom: "Croque-monsieur", categorie: "plat principal", sousCategorie: "Sandwich chaud", marque: null, kcal: 320, qn: 2, portionDefaut: "1 pièce (120g)", unite: "g", alternatives: ["Croque-madame", "Quiche lorraine"], typeOrigine: "maison" },
      { nom: "Quiche lorraine", categorie: "plat principal", sousCategorie: "Tarte salée", marque: null, kcal: 320, qn: 2, portionDefaut: "1 part (150g)", unite: "g", alternatives: ["Tarte aux poireaux", "Flamiche"], typeOrigine: "maison" },
      { nom: "Salade niçoise", categorie: "entrée", sousCategorie: "Salade composée", marque: null, kcal: 180, qn: 3, portionDefaut: "1 assiette (250g)", unite: "g", alternatives: ["Salade de lentilles", "Salade de riz"], typeOrigine: "maison" },
      { nom: "Gratin de courgettes express", categorie: "accompagnement", sousCategorie: "Gratin", marque: null, kcal: 110, qn: 3, portionDefaut: "1 part (150g)", unite: "g", alternatives: ["Gratin dauphinois", "Ratatouille"], typeOrigine: "maison" },
      { nom: "Poêlée de légumes", categorie: "accompagnement", sousCategorie: "Légumes sautés", marque: null, kcal: 90, qn: 3, portionDefaut: "1 assiette (200g)", unite: "g", alternatives: ["Ratatouille", "Gratin de courgettes express"], typeOrigine: "maison" },
      { nom: "Escalope de poulet à la crème", categorie: "plat principal", sousCategorie: "Volaille", marque: null, kcal: 250, qn: 2, portionDefaut: "1 escalope (150g)", unite: "g", alternatives: ["Sauté de dinde", "Poulet rôti"], typeOrigine: "maison" },
      { nom: "Filet de poisson au citron", categorie: "plat principal", sousCategorie: "Poisson", marque: null, kcal: 180, qn: 2, portionDefaut: "1 filet (120g)", unite: "g", alternatives: ["Poisson pané maison", "Saumon vapeur"], typeOrigine: "maison" },
      { nom: "Steak haché purée", categorie: "plat principal", sousCategorie: "Viande hachée", marque: null, kcal: 320, qn: 2, portionDefaut: "1 assiette (250g)", unite: "g", alternatives: ["Saucisse purée", "Poulet rôti"], typeOrigine: "maison" },
      { nom: "Ratatouille rapide", categorie: "accompagnement", sousCategorie: "Légumes mijotés", marque: null, kcal: 70, qn: 3, portionDefaut: "1 assiette (200g)", unite: "g", alternatives: ["Poêlée de légumes", "Gratin de courgettes express"], typeOrigine: "maison" },
      { nom: "Pâtes carbonara maison", categorie: "plat principal", sousCategorie: "Pâtes", marque: null, kcal: 350, qn: 2, portionDefaut: "1 assiette (200g)", unite: "g", alternatives: ["Pâtes bolognaise", "Riz cantonais maison"], typeOrigine: "maison" },
      { nom: "Riz cantonais maison", categorie: "plat principal", sousCategorie: "Riz sauté", marque: null, kcal: 320, qn: 2, portionDefaut: "1 assiette (200g)", unite: "g", alternatives: ["Pâtes carbonara maison", "Poêlée de légumes"], typeOrigine: "maison" },
      { nom: "Tarte tomate-moutarde", categorie: "plat principal", sousCategorie: "Tarte salée", marque: null, kcal: 280, qn: 2, portionDefaut: "1 part (150g)", unite: "g", alternatives: ["Quiche lorraine", "Tarte aux poireaux"], typeOrigine: "maison" },
      { nom: "Soupe de légumes express", categorie: "entrée", sousCategorie: "Soupe", marque: null, kcal: 60, qn: 3, portionDefaut: "1 bol (250ml)", unite: "ml", alternatives: ["Soupe de potiron", "Velouté de légumes"], typeOrigine: "maison" },
      // Exemples plats maison, restaurant, industriel (avec typeOrigine)
      { nom: "Blanquette de veau", categorie: "plat principal", sousCategorie: "Plat mijoté", marque: null, kcal: 350, qn: 2, portionDefaut: "350g", unite: "g", alternatives: ["Sauté de veau", "Bœuf bourguignon"], typeOrigine: "maison" },
      { nom: "Bœuf bourguignon", categorie: "plat principal", sousCategorie: "Plat mijoté", marque: null, kcal: 380, qn: 2, portionDefaut: "350g", unite: "g", alternatives: ["Blanquette de veau", "Daube provençale"], typeOrigine: "maison" },
      { nom: "Quiche lorraine", categorie: "plat principal", sousCategorie: "Tarte salée", marque: null, kcal: 320, qn: 2, portionDefaut: "1 part (150g)", unite: "g", alternatives: ["Tarte aux poireaux", "Flamiche"], typeOrigine: "maison" },
      { nom: "Cassoulet maison", categorie: "plat principal", sousCategorie: "Plat mijoté", marque: null, kcal: 420, qn: 2, portionDefaut: "350g", unite: "g", alternatives: ["Cassoulet industriel", "Pot-au-feu"], typeOrigine: "maison" },
      { nom: "Cassoulet industriel", categorie: "plat principal", sousCategorie: "Plat mijoté", marque: "William Saurin", kcal: 480, qn: 1, portionDefaut: "350g", unite: "g", alternatives: ["Cassoulet maison", "Pot-au-feu"], typeOrigine: "industriel" },
      { nom: "Bœuf bourguignon restaurant", categorie: "plat principal", sousCategorie: "Plat mijoté", marque: null, kcal: 410, qn: 1, portionDefaut: "350g", unite: "g", alternatives: ["Blanquette de veau", "Daube provençale"], typeOrigine: "restaurant" },
      // Sauces industrielles et cuisson (marques connues)
      { nom: "Sauce bolognaise", categorie: "sauce", sousCategorie: "Sauce tomate cuisinée", marque: "Panzani", kcal: 60, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Sauce provençale", "Sauce napolitaine"] },
      { nom: "Sauce provençale", categorie: "sauce", sousCategorie: "Sauce tomate cuisinée", marque: "Barilla", kcal: 55, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Sauce bolognaise", "Sauce napolitaine"] },
      { nom: "Sauce tomate cuisinée", categorie: "sauce", sousCategorie: "Sauce tomate cuisinée", marque: "Zapetti", kcal: 50, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Sauce bolognaise", "Sauce provençale"] },
      { nom: "Sauce béchamel", categorie: "sauce", sousCategorie: "Sauce blanche", marque: "Président", kcal: 110, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Sauce carbonara", "Sauce forestière"] },
      { nom: "Sauce carbonara", categorie: "sauce", sousCategorie: "Sauce blanche", marque: "Barilla", kcal: 120, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Sauce béchamel", "Sauce forestière"] },
      { nom: "Sauce curry", categorie: "sauce", sousCategorie: "Sauce épicée", marque: "Amora", kcal: 80, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Sauce barbecue", "Sauce samouraï"] },
      { nom: "Sauce pour cuisson poulet", categorie: "sauce", sousCategorie: "Sauce cuisson", marque: "Maggi", kcal: 60, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Sauce curry", "Sauce barbecue"] },
      { nom: "Sauce pesto vert", categorie: "sauce", sousCategorie: "Sauce pesto", marque: "Barilla", kcal: 320, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Sauce tomate cuisinée", "Sauce napolitaine"] },
      { nom: "Sauce napolitaine", categorie: "sauce", sousCategorie: "Sauce tomate cuisinée", marque: "Panzani", kcal: 55, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Sauce bolognaise", "Sauce provençale"] },
      { nom: "Sauce forestière", categorie: "sauce", sousCategorie: "Sauce champignon", marque: "Knorr", kcal: 90, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Sauce béchamel", "Sauce carbonara"] },
      // Fruits transformés et jus (marques connues)
      { nom: "Compote de pomme", categorie: "fruit transformé", sousCategorie: "Compote", marque: "Andros", kcal: 68, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Compote de pomme-banane", "Pom’Potes pomme-fraise"] },
      { nom: "Compote de pomme-banane", categorie: "fruit transformé", sousCategorie: "Compote", marque: "Materne", kcal: 70, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Compote de pomme", "Pom’Potes pomme-fraise"] },
      { nom: "Pom’Potes pomme-fraise", categorie: "fruit transformé", sousCategorie: "Compote gourde", marque: "Materne", kcal: 68, qn: 1, portionDefaut: "90g", unite: "g", alternatives: ["Compote de pomme", "Compote de pomme-banane"] },
      { nom: "Jus d’orange", categorie: "boisson", sousCategorie: "Jus de fruits", marque: "Tropicana", kcal: 45, qn: 1, portionDefaut: "200ml", unite: "ml", alternatives: ["Jus de pomme", "Jus multifruits"] },
      { nom: "Jus de pomme", categorie: "boisson", sousCategorie: "Jus de fruits", marque: "Innocent", kcal: 42, qn: 1, portionDefaut: "200ml", unite: "ml", alternatives: ["Jus d’orange", "Jus multifruits"] },
      { nom: "Jus multifruits", categorie: "boisson", sousCategorie: "Jus de fruits", marque: "Pago", kcal: 50, qn: 1, portionDefaut: "200ml", unite: "ml", alternatives: ["Jus d’orange", "Jus de pomme"] },
      { nom: "Nectar d’abricot", categorie: "boisson", sousCategorie: "Nectar de fruits", marque: "Andros", kcal: 60, qn: 1, portionDefaut: "200ml", unite: "ml", alternatives: ["Jus d’orange", "Jus multifruits"] },
      // Céréales petit-déjeuner (marques connues)
      { nom: "Corn Flakes", categorie: "féculent", sousCategorie: "Céréales petit-déjeuner", marque: "Kellogg’s", kcal: 150, qn: 2, portionDefaut: "30g", unite: "g", alternatives: ["Special K", "Weetabix"] },
      { nom: "Special K", categorie: "féculent", sousCategorie: "Céréales petit-déjeuner", marque: "Kellogg’s", kcal: 160, qn: 2, portionDefaut: "30g", unite: "g", alternatives: ["Corn Flakes", "Fitness"] },
      { nom: "Weetabix", categorie: "féculent", sousCategorie: "Céréales petit-déjeuner", marque: "Weetabix", kcal: 112, qn: 2, portionDefaut: "2 biscuits (37,5g)", unite: "g", alternatives: ["Granola", "Country Crisp"] },
      { nom: "Granola", categorie: "féculent", sousCategorie: "Céréales petit-déjeuner", marque: "Jordans", kcal: 180, qn: 2, portionDefaut: "40g", unite: "g", alternatives: ["Muesli", "Country Crisp"] },
      { nom: "Trésor", categorie: "féculent", sousCategorie: "Céréales petit-déjeuner", marque: "Kellogg’s", kcal: 200, qn: 2, portionDefaut: "30g", unite: "g", alternatives: ["Chocapic", "Lion Céréales"] },
      { nom: "Miel Pops", categorie: "féculent", sousCategorie: "Céréales petit-déjeuner", marque: "Kellogg’s", kcal: 120, qn: 2, portionDefaut: "30g", unite: "g", alternatives: ["Frosties", "Chocapic"] },
      { nom: "Fitness", categorie: "féculent", sousCategorie: "Céréales petit-déjeuner", marque: "Nestlé", kcal: 112, qn: 2, portionDefaut: "30g", unite: "g", alternatives: ["Special K", "Country Crisp"] },
      { nom: "Lion Céréales", categorie: "féculent", sousCategorie: "Céréales petit-déjeuner", marque: "Nestlé", kcal: 160, qn: 2, portionDefaut: "30g", unite: "g", alternatives: ["Trésor", "Chocapic"] },
      { nom: "Country Crisp", categorie: "féculent", sousCategorie: "Céréales petit-déjeuner", marque: "Jordans", kcal: 180, qn: 2, portionDefaut: "40g", unite: "g", alternatives: ["Granola", "Weetabix"] },

      // Yaourts et produits laitiers (marques connues)
      { nom: "Yaourt nature", categorie: "laitier", sousCategorie: "Yaourt nature", marque: "Danone", kcal: 60, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt brassé nature", "Yaourt grec nature"] },
      { nom: "Yaourt brassé nature", categorie: "laitier", sousCategorie: "Yaourt brassé", marque: "Yoplait", kcal: 65, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt nature", "Yaourt grec nature"] },
      { nom: "Yaourt grec nature", categorie: "laitier", sousCategorie: "Yaourt grec", marque: "Fage", kcal: 90, qn: 1, portionDefaut: "150g", unite: "g", alternatives: ["Yaourt nature", "Yaourt brassé nature"] },
      { nom: "Yaourt aux fruits", categorie: "laitier", sousCategorie: "Yaourt aux fruits", marque: "Activia", kcal: 90, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt vanille", "Yaourt sucré"] },
      { nom: "Yaourt vanille", categorie: "laitier", sousCategorie: "Yaourt aromatisé", marque: "La Laitière", kcal: 95, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt aux fruits", "Yaourt sucré"] },
      { nom: "Yaourt sucré", categorie: "laitier", sousCategorie: "Yaourt sucré", marque: "Yoplait", kcal: 90, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt nature", "Yaourt vanille"] },
      { nom: "Skyr nature", categorie: "laitier", sousCategorie: "Skyr", marque: "Arla", kcal: 60, qn: 1, portionDefaut: "140g", unite: "g", alternatives: ["Fromage blanc", "Yaourt nature"] },
      { nom: "Fromage blanc", categorie: "laitier", sousCategorie: "Fromage blanc", marque: "Danone", kcal: 80, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Skyr nature", "Petit Suisse"] },
      { nom: "Petit Suisse", categorie: "laitier", sousCategorie: "Petit Suisse", marque: "Gervais", kcal: 60, qn: 1, portionDefaut: "60g", unite: "g", alternatives: ["Fromage blanc", "Yaourt nature"] },
      { nom: "Perle de Lait", categorie: "laitier", sousCategorie: "Yaourt dessert", marque: "Yoplait", kcal: 110, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt vanille", "Yaourt aux fruits"] },
      { nom: "Sojasun nature", categorie: "laitier", sousCategorie: "Yaourt végétal", marque: "Sojasun", kcal: 55, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Alpro amande", "Yaourt nature"] },
      { nom: "Alpro amande", categorie: "laitier", sousCategorie: "Yaourt végétal", marque: "Alpro", kcal: 50, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Sojasun nature", "Yaourt nature"] },
      { nom: "Yop fraise", categorie: "laitier", sousCategorie: "Boisson lactée", marque: "Yoplait", kcal: 90, qn: 1, portionDefaut: "180g", unite: "g", alternatives: ["Actimel nature", "Candy’Up chocolat"] },
      { nom: "Actimel nature", categorie: "laitier", sousCategorie: "Boisson lactée", marque: "Danone", kcal: 60, qn: 1, portionDefaut: "100g", unite: "g", alternatives: ["Yop fraise", "Candy’Up chocolat"] },
      { nom: "Candy’Up chocolat", categorie: "laitier", sousCategorie: "Lait aromatisé", marque: "Candia", kcal: 70, qn: 1, portionDefaut: "200ml", unite: "ml", alternatives: ["Actimel nature", "Yop fraise"] },
      { nom: "Yaourt nature", categorie: "laitier", sousCategorie: "Yaourt nature", marque: "Yaos", kcal: 60, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt brassé nature", "Yaourt grec nature"] },
      { nom: "Yaourt vanille", categorie: "laitier", sousCategorie: "Yaourt aromatisé", marque: "Yaos", kcal: 95, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt aux fruits", "Yaourt sucré"] },
      { nom: "Yaourt nature", categorie: "laitier", sousCategorie: "Yaourt nature", marque: "La Laitière", kcal: 60, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt brassé nature", "Yaourt grec nature"] },
      { nom: "Yaourt vanille", categorie: "laitier", sousCategorie: "Yaourt aromatisé", marque: "La Laitière", kcal: 95, qn: 1, portionDefaut: "125g", unite: "g", alternatives: ["Yaourt aux fruits", "Yaourt sucré"] },
    { nom: "Kiri", categorie: "fromage", sousCategorie: "Fromage industriel", marque: "Kiri", kcal: 45, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Vache qui rit", "Babybel"] },
    { nom: "Babybel", categorie: "fromage", sousCategorie: "Fromage industriel", marque: "Babybel", kcal: 65, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Kiri", "Vache qui rit"] },
    { nom: "Vache qui rit", categorie: "fromage", sousCategorie: "Fromage industriel", marque: "Vache qui rit", kcal: 35, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Kiri", "Babybel"] },
    { nom: "Apéricube", categorie: "fromage", sousCategorie: "Fromage industriel", marque: "Apéricube", kcal: 12, qn: 1, portionDefaut: "1 cube", unite: "piece", alternatives: ["Kiri", "Vache qui rit"] },
      // Fromages AOP et spécialités françaises (ajout plan enrichissement)
      { nom: "Camembert", categorie: "fromage", sousCategorie: "Fromage AOP", marque: "Président", kcal: 80, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Brie", "Coulommiers"] },
      { nom: "Brie", categorie: "fromage", sousCategorie: "Fromage AOP", marque: "Président", kcal: 90, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Camembert", "Coulommiers"] },
      { nom: "Roquefort", categorie: "fromage", sousCategorie: "Fromage AOP", marque: "Société", kcal: 100, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Bleu d’Auvergne", "Fourme d’Ambert"] },
      { nom: "Comté", categorie: "fromage", sousCategorie: "Fromage AOP", marque: "Entremont", kcal: 120, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Emmental", "Cantal"] },
      { nom: "Chèvre frais", categorie: "fromage", sousCategorie: "Fromage chèvre", marque: "Soignon", kcal: 75, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Bûche de chèvre", "Petit Billy"] },
      { nom: "Emmental râpé", categorie: "fromage", sousCategorie: "Fromage râpé", marque: "Entremont", kcal: 110, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Comté", "Mozzarella râpée"] },
      { nom: "Emmental bloc", categorie: "fromage", sousCategorie: "Fromage", marque: "Entremont", kcal: 110, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Comté", "Cantal"] },
      { nom: "Emmental tranches", categorie: "fromage", sousCategorie: "Fromage", marque: "Entremont", kcal: 110, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Comté", "Cantal"] },
      { nom: "Saint-Nectaire", categorie: "fromage", sousCategorie: "Fromage AOP", marque: null, kcal: 90, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Reblochon", "Cantal"] },
      { nom: "Reblochon", categorie: "fromage", sousCategorie: "Fromage AOP", marque: null, kcal: 95, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Saint-Nectaire", "Tomme de Savoie"] },
      { nom: "Cantal", categorie: "fromage", sousCategorie: "Fromage AOP", marque: null, kcal: 110, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Comté", "Emmental"] },
      { nom: "Bleu d’Auvergne", categorie: "fromage", sousCategorie: "Fromage AOP", marque: null, kcal: 100, qn: 1, portionDefaut: "30g", unite: "g", alternatives: ["Roquefort", "Fourme d’Ambert"] },
      { nom: "Boursin", categorie: "fromage", sousCategorie: "Fromage frais", marque: "Boursin", kcal: 80, qn: 1, portionDefaut: "16g", unite: "g", alternatives: ["Tartare", "Saint-Morêt"] },
      { nom: "Tartare", categorie: "fromage", sousCategorie: "Fromage frais", marque: "Tartare", kcal: 80, qn: 1, portionDefaut: "16g", unite: "g", alternatives: ["Boursin", "Saint-Morêt"] },
        { nom: "Saint-Morêt", categorie: "fromage", sousCategorie: "Fromage frais", marque: "Saint-Morêt", kcal: 70, qn: 1, portionDefaut: "16g", unite: "g", alternatives: ["Boursin", "Tartare"] },
  // ═══════════════════════════════════════════════════════════
  // 🍚 FÉCULENTS
  // ═══════════════════════════════════════════════════════════
  
  // RIZ
  { 
    nom: "Riz blanc / basmati", 
    categorie: "féculent", 
    sousCategorie: "Riz", 
    kcal: 180,
    qn: 2,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 90,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS Bombées", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Riz complet", "Quinoa", "Couscous"] 
  },
  { 
    nom: "Riz complet", 
    categorie: "féculent", 
    sousCategorie: "Riz", 
    kcal: 170,
    qn: 3,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 85,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Riz blanc", "Quinoa"] 
  },
  
  // PÂTES
  { 
    nom: "Pâtes blanches", 
    categorie: "féculent", 
    sousCategorie: "Pâtes", 
    kcal: 210,
    qn: 2,
    portionDefaut: "3 CS",
    unite: "CS",
    kcalParUnite: 70,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "3 CS Bombées", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pâtes complètes", "Riz"] 
  },
  { 
    nom: "Pâtes complètes", 
    categorie: "féculent", 
    sousCategorie: "Pâtes", 
    kcal: 195,
    qn: 2,
    portionDefaut: "3 CS",
    unite: "CS",
    kcalParUnite: 65,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "3 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pâtes blanches", "Quinoa"] 
  },
  
  // AUTRES FÉCULENTS
  { 
    nom: "Quinoa", 
    categorie: "féculent", 
    sousCategorie: "Graines", 
    kcal: 170,
    qn: 3,
    portionDefaut: "2.5 CS",
    unite: "CS",
    kcalParUnite: 68,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2.5 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Riz complet", "Boulgour"] 
  },
  { 
    nom: "Boulgour", 
    categorie: "féculent", 
    sousCategorie: "Semoule", 
    kcal: 180,
    qn: 3,
    portionDefaut: "2.5 CS",
    unite: "CS",
    kcalParUnite: 72,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2.5 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Couscous", "Quinoa"] 
  },
  { 
    nom: "Couscous (semoule)", 
    categorie: "féculent", 
    sousCategorie: "Semoule", 
    kcal: 150,
    qn: 2,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 75,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Boulgour", "Quinoa"] 
  },
  { 
    nom: "Polenta", 
    categorie: "féculent", 
    sousCategorie: "Semoule", 
    kcal: 150,
    qn: 2,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 75,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Couscous", "Riz"] 
  },
  { 
    nom: "Millet", 
    categorie: "féculent", 
    sousCategorie: "Graines", 
    kcal: 140,
    qn: 3,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 70,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Quinoa", "Riz complet"] 
  },
  { 
    nom: "Sarrasin (kasha)", 
    categorie: "féculent", 
    sousCategorie: "Graines", 
    kcal: 155,
    qn: 3,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 77,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Quinoa", "Millet"] 
  },
  { 
    nom: "Orge perlé", 
    categorie: "féculent", 
    sousCategorie: "Graines", 
    kcal: 160,
    qn: 3,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 80,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Boulgour", "Quinoa"] 
  },
  { 
    nom: "Épeautre (petit épeautre)", 
    categorie: "féculent", 
    sousCategorie: "Graines", 
    kcal: 170,
    qn: 3,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 85,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Riz complet", "Quinoa"] 
  },
  { 
    nom: "Kamut", 
    categorie: "féculent", 
    sousCategorie: "Graines", 
    kcal: 175,
    qn: 3,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 87,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Épeautre", "Riz complet"] 
  },
  { 
    nom: "Riz noir (riz vénéré)", 
    categorie: "féculent", 
    sousCategorie: "Riz", 
    kcal: 165,
    qn: 3,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 82,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Riz complet", "Riz rouge"] 
  },
  { 
    nom: "Riz rouge", 
    categorie: "féculent", 
    sousCategorie: "Riz", 
    kcal: 165,
    qn: 3,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 82,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Riz complet", "Riz noir"] 
  },
  { 
    nom: "Gnocchi", 
    categorie: "féculent", 
    sousCategorie: "Pâtes", 
    kcal: 220,
    qn: 2,
    portionDefaut: "150g (cuits)",
    unite: "portion",
    kcalParUnite: 220,
    mesureRecommandee: "Portion visuelle",
    portionMax: "150g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pâtes", "Pomme de terre"] 
  },
  { 
    nom: "Tapioca (perles)", 
    categorie: "féculent", 
    sousCategorie: "Tubercules", 
    kcal: 140,
    qn: 2,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 70,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Riz au lait", "Semoule"] 
  },
  { 
    nom: "Panisse (pois chiche)", 
    categorie: "féculent", 
    sousCategorie: "Préparations", 
    kcal: 120,
    qn: 2,
    portionDefaut: "100g",
    unite: "portion",
    kcalParUnite: 120,
    mesureRecommandee: "Portion visuelle",
    portionMax: "100g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Polenta", "Falafel"] 
  },
  { 
    nom: "Tortilla (blé)", 
    categorie: "féculent", 
    sousCategorie: "Pain", 
    kcal: 150,
    qn: 2,
    portionDefaut: "1 tortilla",
    unite: "piece",
    kcalParUnite: 150,
    mesureRecommandee: "Unité",
    portionMax: "1-2 pièces", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pain complet", "Galette sarrasin"] 
  },
  { 
    nom: "Galette sarrasin", 
    categorie: "féculent", 
    sousCategorie: "Pain", 
    kcal: 180,
    qn: 3,
    portionDefaut: "1 galette",
    unite: "piece",
    kcalParUnite: 180,
    mesureRecommandee: "Unité",
    portionMax: "1 galette", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Crêpe complète", "Tortilla"] 
  },
  { 
    nom: "Flocons d'avoine", 
    categorie: "féculent", 
    sousCategorie: "Céréales petit-déjeuner", 
    kcal: 130,
    qn: 2,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 65,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Céréales muesli", "Pain complet"] 
  },
  
  // POMMES DE TERRE
  { 
    nom: "Pomme de terre", 
    categorie: "féculent", 
    sousCategorie: "Tubercules", 
    kcal: 110,
    qn: 2,
    portionDefaut: "1 moyenne (150g)",
    unite: "portion",
    kcalParUnite: 110,
    mesureRecommandee: "Portion visuelle",
    portionMax: "1 moyenne", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Patate douce", "Riz"] 
  },
  { 
    nom: "Frites maison (friteuse)", 
    categorie: "féculent", 
    sousCategorie: "Tubercules", 
    kcal: 300,
    qn: 2,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 3,
    mesureRecommandee: "Grammes",
    portionMax: "150g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Frites au four", "Pomme de terre"] 
  },
  { 
    nom: "Frites au four", 
    categorie: "féculent", 
    sousCategorie: "Tubercules", 
    kcal: 200,
    qn: 3,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 2,
    mesureRecommandee: "Grammes",
    portionMax: "150g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pomme de terre", "Patate douce"] 
  },
  { 
    nom: "Frites fraîches maison", 
    categorie: "féculent", 
    sousCategorie: "Tubercules", 
    kcal: 250,
    qn: 3,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 2.5,
    mesureRecommandee: "Grammes",
    portionMax: "150g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Frites au four", "Pomme de terre"] 
  },
  { 
    nom: "Patate douce", 
    categorie: "féculent", 
    sousCategorie: "Tubercules", 
    kcal: 130,
    qn: 3,
    portionDefaut: "1 petite (130-150g)",
    unite: "portion",
    kcalParUnite: 130,
    mesureRecommandee: "Portion visuelle",
    portionMax: "1 petite", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pomme de terre", "Manioc"] 
  },
  { 
    nom: "Manioc", 
    categorie: "féculent", 
    sousCategorie: "Tubercules", 
    kcal: 160,
    qn: 2,
    portionDefaut: "1 morceau moyen (100g)",
    unite: "portion",
    kcalParUnite: 160,
    mesureRecommandee: "Portion visuelle",
    portionMax: "100g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Patate douce", "Pomme de terre"] 
  },
  
  // PAIN
  { 
    nom: "Pain complet", 
    categorie: "féculent", 
    sousCategorie: "Pain", 
    kcal: 80,
    qn: 3,
    portionDefaut: "1 tranche (30g)",
    unite: "tranche",
    kcalParUnite: 80,
    mesureRecommandee: "Tranche",
    portionMax: "1-2 tranches", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain de mie complet", "Céréales muesli"] 
  },
  { 
    nom: "Pain de mie complet", 
    categorie: "féculent", 
    sousCategorie: "Pain", 
    kcal: 90,
    qn: 3,
    portionDefaut: "1 tranche (35g)",
    unite: "tranche",
    kcalParUnite: 90,
    mesureRecommandee: "Tranche",
    portionMax: "1 tranche", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet", "Biscottes"] 
  },
  { 
    nom: "Pain (baguette)", 
    categorie: "féculent", 
    sousCategorie: "Pain", 
    kcal: 160,
    qn: 2,
    portionDefaut: "60g",
    unite: "g",
    kcalParUnite: 2.67,
    mesureRecommandee: "Portion en g",
    portionMax: "60g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pain complet"] 
  },
  
  // VIENNOISERIES
  { 
    nom: "Mini croissant", 
    categorie: "viennoiserie", 
    sousCategorie: "Viennoiseries", 
    kcal: 150,
    qn: 1,
    portionDefaut: "1 pièce",
    unite: "piece",
    kcalParUnite: 150,
    mesureRecommandee: "Unité",
    portionMax: "2 pièces", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet", "Céréales muesli"] 
  },
  { 
    nom: "Mini pain au chocolat", 
    categorie: "viennoiserie", 
    sousCategorie: "Viennoiseries", 
    kcal: 180,
    qn: 1,
    portionDefaut: "1 pièce",
    unite: "piece",
    kcalParUnite: 180,
    mesureRecommandee: "Unité",
    portionMax: "2 pièces", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet", "Céréales muesli"] 
  },
  { 
    nom: "Mini pain aux raisins", 
    categorie: "viennoiserie", 
    sousCategorie: "Viennoiseries", 
    kcal: 160,
    qn: 1,
    portionDefaut: "1 pièce",
    unite: "piece",
    kcalParUnite: 160,
    mesureRecommandee: "Unité",
    portionMax: "2 pièces", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet", "Céréales muesli"] 
  },
  
  // CÉRÉALES
  { 
    nom: "Céréales muesli", 
    categorie: "féculent", 
    sousCategorie: "Céréales petit-déjeuner", 
    kcal: 220,
    qn: 2,
    portionDefaut: "3.5 CS (40g)",
    unite: "CS",
    kcalParUnite: 37,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "40g", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Flocons d'avoine", "Pain complet"] 
  },
  
  // BISCUITS
  { 
    nom: "Biscuits digestifs", 
    categorie: "féculent", 
    sousCategorie: "Biscuits/gâteaux", 
    kcal: 450,
    qn: 2,
    portionDefaut: "2 pièces",
    unite: "piece",
    kcalParUnite: 225,
    mesureRecommandee: "Unité",
    portionMax: "2 pièces", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruits frais", "Amandes"] 
  },

  // ═══════════════════════════════════════════════════════════
  // 🌱 LÉGUMINEUSES
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Lentilles (cuites)", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 160,
    qn: 5,
    portionDefaut: "2.5 CS",
    unite: "CS",
    kcalParUnite: 64,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2.5 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pois chiches", "Haricots rouges"] 
  },
  { 
    nom: "Pois chiches (cuits)", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 160,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 80,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Lentilles", "Haricots rouges"] 
  },
  { 
    nom: "Haricots rouges (cuits)", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 140,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 70,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Lentilles", "Pois chiches"] 
  },
  { 
    nom: "Fèves", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 120,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 60,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pois chiches", "Lentilles"] 
  },
  { 
    nom: "Pois cassés", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 130,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 65,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Lentilles", "Pois chiches"] 
  },
  { 
    nom: "Soja (edamame, cuit)", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 120,
    qn: 5,
    portionDefaut: "100g",
    unite: "portion",
    kcalParUnite: 120,
    mesureRecommandee: "Portion visuelle",
    portionMax: "100g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pois chiches", "Fèves"] 
  },
  { 
    nom: "Haricots blancs (cuits)", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 135,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 67,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Haricots rouges", "Pois chiches"] 
  },
  { 
    nom: "Haricots noirs (cuits)", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 130,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 65,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Haricots rouges", "Lentilles"] 
  },
  { 
    nom: "Azukis (haricots rouges japonais)", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 125,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 62,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Lentilles", "Haricots rouges"] 
  },
  { 
    nom: "Lupin (graines)", 
    categorie: "légumineuse", 
    sousCategorie: "Légumineuses", 
    kcal: 115,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 57,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Pois chiches grillés", "Amandes"] 
  },

  // ═══════════════════════════════════════════════════════════
  // 🥚 PROTÉINES
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Œuf", 
    categorie: "protéine", 
    sousCategorie: "Œufs", 
    kcal: 80,
    qn: 3,
    portionDefaut: "1 œuf",
    unite: "piece",
    kcalParUnite: 80,
    mesureRecommandee: "Unité",
    portionMax: "2 œufs", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Jambon blanc", "Fromage blanc"] 
  },
  { 
    nom: "Poulet (blanc, cuit)", 
    categorie: "protéine", 
    sousCategorie: "Viandes", 
    kcal: 180,
    qn: 3,
    portionDefaut: "120g",
    unite: "g",
    kcalParUnite: 1.5,
    mesureRecommandee: "Portion en g",
    portionMax: "100-120g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Dinde", "Poisson blanc"] 
  },
  { 
    nom: "Poisson blanc (cabillaud)", 
    categorie: "protéine", 
    sousCategorie: "Poissons", 
    kcal: 150,
    qn: 4,
    portionDefaut: "120g",
    unite: "g",
    kcalParUnite: 1.25,
    mesureRecommandee: "Portion en g",
    portionMax: "100-120g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Poulet", "Saumon"] 
  },
  { 
    nom: "Saumon", 
    categorie: "protéine", 
    sousCategorie: "Poissons", 
    kcal: 220,
    qn: 2,
    portionDefaut: "120g",
    unite: "g",
    kcalParUnite: 1.83,
    mesureRecommandee: "Portion en g",
    portionMax: "100-120g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Poisson blanc", "Poulet"] 
  },
  { 
    nom: "Tofu nature", 
    categorie: "protéine", 
    sousCategorie: "Protéines végétales", 
    kcal: 120,
    qn: 3,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 1.2,
    mesureRecommandee: "Portion en g",
    portionMax: "100g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Tempeh", "Seitan", "Poulet"] 
  },
  { 
    nom: "Tempeh", 
    categorie: "protéine", 
    sousCategorie: "Protéines végétales", 
    kcal: 180,
    qn: 3,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 1.8,
    mesureRecommandee: "Portion en g",
    portionMax: "100g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Tofu", "Seitan"] 
  },
  { 
    nom: "Seitan", 
    categorie: "protéine", 
    sousCategorie: "Protéines végétales", 
    kcal: 140,
    qn: 3,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 1.4,
    mesureRecommandee: "Portion en g",
    portionMax: "100g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Tofu", "Tempeh"] 
  },
  { 
    nom: "Fromage (comté, emmental)", 
    categorie: "protéine", 
    sousCategorie: "Fromages", 
    kcal: 120,
    qn: 2,
    portionDefaut: "30g",
    unite: "g",
    kcalParUnite: 4,
    mesureRecommandee: "Portion en g",
    portionMax: "30g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Fromage blanc", "Yaourt"] 
  },
  { 
    nom: "Yaourt nature", 
    categorie: "protéine", 
    sousCategorie: "Laitages", 
    kcal: 90,
    qn: 3,
    portionDefaut: "1 pot (125g)",
    unite: "pot",
    kcalParUnite: 90,
    mesureRecommandee: "Unité",
    portionMax: "1 pot", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Fromage blanc", "Skyr"] 
  },
  { 
    nom: "Dinde (escalope cuite)", 
    categorie: "protéine", 
    sousCategorie: "Viandes", 
    kcal: 110,
    qn: 3,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 1.1,
    mesureRecommandee: "Portion en g",
    portionMax: "100-120g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Poulet", "Poisson blanc"] 
  },
  { 
    nom: "Bœuf maigre (5% MG)", 
    categorie: "protéine", 
    sousCategorie: "Viandes", 
    kcal: 160,
    qn: 3,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 1.6,
    mesureRecommandee: "Portion en g",
    portionMax: "100g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Poulet", "Dinde"] 
  },
  { 
    nom: "Agneau (gigot maigre)", 
    categorie: "protéine", 
    sousCategorie: "Viandes", 
    kcal: 180,
    qn: 2,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 1.8,
    mesureRecommandee: "Portion en g",
    portionMax: "100g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Bœuf", "Poulet"] 
  },
  { 
    nom: "Jambon blanc (sans couenne)", 
    categorie: "protéine", 
    sousCategorie: "Viandes", 
    kcal: 110,
    qn: 3,
    portionDefaut: "2 tranches (60g)",
    unite: "tranche",
    kcalParUnite: 33,
    mesureRecommandee: "Tranche",
    portionMax: "2-3 tranches", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Œuf", "Fromage blanc"] 
  },
  { 
    nom: "Chorizo", 
    categorie: "protéine", 
    sousCategorie: "Viandes", 
    kcal: 100,
    qn: 2,
    portionDefaut: "1 tranche (30g)",
    unite: "tranche",
    kcalParUnite: 100,
    mesureRecommandee: "Tranche",
    portionMax: "1 tranche", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Jambon blanc", "Poulet"] 
  },
  { 
    nom: "Thon (naturel, boîte)", 
    categorie: "protéine", 
    sousCategorie: "Poissons", 
    kcal: 100,
    qn: 3,
    portionDefaut: "1 petite boîte (80g)",
    unite: "boite",
    kcalParUnite: 100,
    mesureRecommandee: "Unité",
    portionMax: "1 boîte", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Saumon", "Sardines"] 
  },
  { 
    nom: "Daurade (filet)", 
    categorie: "protéine", 
    sousCategorie: "Poissons", 
    kcal: 110,
    qn: 4,
    portionDefaut: "120g",
    unite: "g",
    kcalParUnite: 0.92,
    mesureRecommandee: "Portion en g",
    portionMax: "120g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Cabillaud", "Limande"] 
  },
  { 
    nom: "Limande (filet)", 
    categorie: "protéine", 
    sousCategorie: "Poissons", 
    kcal: 90,
    qn: 4,
    portionDefaut: "120g",
    unite: "g",
    kcalParUnite: 0.75,
    mesureRecommandee: "Portion en g",
    portionMax: "120g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Cabillaud", "Daurade"] 
  },
  { 
    nom: "Sardines (boîte huile)", 
    categorie: "protéine", 
    sousCategorie: "Poissons", 
    kcal: 200,
    qn: 2,
    portionDefaut: "1 boîte (100g)",
    unite: "boite",
    kcalParUnite: 200,
    mesureRecommandee: "Unité",
    portionMax: "1 boîte", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Thon", "Saumon"] 
  },
  { 
    nom: "Crevettes (cuites)", 
    categorie: "protéine", 
    sousCategorie: "Fruits de mer", 
    kcal: 90,
    qn: 4,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 0.9,
    mesureRecommandee: "Portion en g",
    portionMax: "100-150g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Poisson blanc", "Moules"] 
  },
  { 
    nom: "Moules (cuites)", 
    categorie: "protéine", 
    sousCategorie: "Fruits de mer", 
    kcal: 100,
    qn: 4,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 1,
    mesureRecommandee: "Portion en g",
    portionMax: "150g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Crevettes", "Poisson"] 
  },
  { 
    nom: "Crabe / Surimi", 
    categorie: "protéine", 
    sousCategorie: "Fruits de mer", 
    kcal: 80,
    qn: 4,
    portionDefaut: "100g (bâtonnets)",
    unite: "g",
    kcalParUnite: 0.8,
    mesureRecommandee: "Portion en g",
    portionMax: "100g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Crevettes", "Poisson blanc"] 
  },
  { 
    nom: "Fromage blanc 0%", 
    categorie: "protéine", 
    sousCategorie: "Laitages", 
    kcal: 50,
    qn: 4,
    portionDefaut: "1 pot (100g)",
    unite: "pot",
    kcalParUnite: 50,
    mesureRecommandee: "Unité",
    portionMax: "1-2 pots", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Yaourt nature", "Skyr"] 
  },
  { 
    nom: "Yaourt grec", 
    categorie: "protéine", 
    sousCategorie: "Laitages", 
    kcal: 130,
    qn: 2,
    portionDefaut: "1 pot (125g)",
    unite: "pot",
    kcalParUnite: 130,
    mesureRecommandee: "Unité",
    portionMax: "1 pot", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Yaourt nature", "Fromage blanc"] 
  },
  { 
    nom: "Skyr", 
    categorie: "protéine", 
    sousCategorie: "Laitages", 
    kcal: 90,
    qn: 4,
    portionDefaut: "1 pot (150g)",
    unite: "pot",
    kcalParUnite: 90,
    mesureRecommandee: "Unité",
    portionMax: "1 pot", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Yaourt grec", "Fromage blanc"] 
  },
  { 
    nom: "Protéine whey (poudre)", 
    categorie: "protéine", 
    sousCategorie: "Compléments", 
    kcal: 100,
    qn: 2,
    portionDefaut: "1 dose (25g)",
    unite: "dose",
    kcalParUnite: 100,
    mesureRecommandee: "Dosette",
    portionMax: "1-2 doses", 
    typeRepas: "Collation", 
    moment: "Post-entraînement", 
    alternatives: ["Fromage blanc", "Œuf"] 
  },

  // ═══════════════════════════════════════════════════════════
  // 🥦 LÉGUMES
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Courgettes (cuites)", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 24,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 12,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Haricots verts", "Brocoli"] 
  },
  { 
    nom: "Carottes râpées", 
    categorie: "légume", 
    sousCategorie: "Légumes racines", 
    kcal: 24,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 12,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "3.5 CS Bombées", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Betteraves râpées", "Salade verte"] 
  },
  { 
    nom: "Haricots verts", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 20,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 10,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "100-150g", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Courgettes cuites", "Brocoli"] 
  },
  { 
    nom: "Épinards (cuits)", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 24,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 12,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Blettes", "Choux"] 
  },
  { 
    nom: "Brocoli (cuit)", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 30,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 15,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Chou-fleur", "Haricots verts"] 
  },
  { 
    nom: "Tomates", 
    categorie: "légume", 
    sousCategorie: "Légumes fruits", 
    kcal: 20,
    qn: 5,
    portionDefaut: "1 tomate moyenne",
    unite: "piece",
    kcalParUnite: 20,
    mesureRecommandee: "Unité",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Concombre", "Poivrons"] 
  },
  { 
    nom: "Poêlée de légumes", 
    categorie: "légume", 
    sousCategorie: "Légumes mélangés", 
    kcal: 35,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 17.5,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Ratatouille", "Légumes vapeur"] 
  },
  { 
    nom: "Poireaux (cuits)", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 25,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 12.5,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Courgettes", "Haricots verts"] 
  },
  { 
    nom: "Concombre", 
    categorie: "légume", 
    sousCategorie: "Légumes fruits", 
    kcal: 10,
    qn: 5,
    portionDefaut: "½ concombre",
    unite: "portion",
    kcalParUnite: 10,
    mesureRecommandee: "Portion visuelle",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Tomates", "Salade verte"] 
  },
  { 
    nom: "Chou-fleur (cuit)", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 20,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 10,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Brocoli", "Chou romanesco"] 
  },
  { 
    nom: "Brocoli (cuit)", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 25,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 12.5,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Chou-fleur", "Haricots verts"] 
  },
  { 
    nom: "Chou romanesco (cuit)", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 22,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 11,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Chou-fleur", "Brocoli"] 
  },
  { 
    nom: "Asperges (vertes)", 
    categorie: "légume", 
    sousCategorie: "Légumes verts", 
    kcal: 25,
    qn: 5,
    portionDefaut: "5 asperges",
    unite: "portion",
    kcalParUnite: 25,
    mesureRecommandee: "Portion visuelle",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Haricots verts", "Courgettes"] 
  },
  { 
    nom: "Endives (crues/cuites)", 
    categorie: "légume", 
    sousCategorie: "Salades", 
    kcal: 15,
    qn: 5,
    portionDefaut: "100g",
    unite: "portion",
    kcalParUnite: 15,
    mesureRecommandee: "Portion visuelle",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Salade verte", "Mâche"] 
  },
  { 
    nom: "Fenouil (cuit)", 
    categorie: "légume", 
    sousCategorie: "Légumes racines", 
    kcal: 20,
    qn: 5,
    portionDefaut: "100g",
    unite: "portion",
    kcalParUnite: 20,
    mesureRecommandee: "Portion visuelle",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Courgettes", "Poireaux"] 
  },
  { 
    nom: "Navet (cuit)", 
    categorie: "légume", 
    sousCategorie: "Légumes racines", 
    kcal: 25,
    qn: 5,
    portionDefaut: "100g",
    unite: "portion",
    kcalParUnite: 25,
    mesureRecommandee: "Portion visuelle",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Carottes", "Panais"] 
  },
  { 
    nom: "Céleri-rave (cuit)", 
    categorie: "légume", 
    sousCategorie: "Légumes racines", 
    kcal: 30,
    qn: 5,
    portionDefaut: "100g",
    unite: "portion",
    kcalParUnite: 30,
    mesureRecommandee: "Portion visuelle",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Carottes", "Navet"] 
  },
  { 
    nom: "Champignons (cuits)", 
    categorie: "légume", 
    sousCategorie: "Champignons", 
    kcal: 20,
    qn: 5,
    portionDefaut: "100g",
    unite: "portion",
    kcalParUnite: 20,
    mesureRecommandee: "Portion visuelle",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Courgettes", "Aubergine"] 
  },
  { 
    nom: "Aubergine (cuite)", 
    categorie: "légume", 
    sousCategorie: "Légumes fruits", 
    kcal: 25,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 12.5,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "À volonté", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Courgettes", "Tomates"] 
  },
  { 
    nom: "Radis (crus)", 
    categorie: "légume", 
    sousCategorie: "Légumes racines", 
    kcal: 15,
    qn: 5,
    portionDefaut: "100g (1 botte)",
    unite: "portion",
    kcalParUnite: 15,
    mesureRecommandee: "Portion visuelle",
    portionMax: "À volonté", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Concombre", "Carottes crues"] 
  },
  { 
    nom: "Artichaut (cœur)", 
    categorie: "légume", 
    sousCategorie: "Légumes fleurs", 
    kcal: 40,
    qn: 5,
    portionDefaut: "1 cœur",
    unite: "piece",
    kcalParUnite: 40,
    mesureRecommandee: "Unité",
    portionMax: "1-2 cœurs", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Asperges", "Chou-fleur"] 
  },

  // ═══════════════════════════════════════════════════════════
  // 🍎 FRUITS
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Banane", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 100,
    qn: 4,
    portionDefaut: "1 banane",
    unite: "piece",
    kcalParUnite: 100,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Pomme", "Poire"] 
  },
  { 
    nom: "Pomme", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 80,
    qn: 4,
    portionDefaut: "1 pomme",
    unite: "piece",
    kcalParUnite: 80,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Poire", "Banane"] 
  },
  { 
    nom: "Raisin", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 70,
    qn: 4,
    portionDefaut: "1 petite grappe (100g)",
    unite: "portion",
    kcalParUnite: 70,
    mesureRecommandee: "Portion visuelle",
    portionMax: "100g", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruits rouges", "Clémentines"] 
  },
  { 
    nom: "Fruits rouges", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 50,
    qn: 4,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 0.5,
    mesureRecommandee: "Portion en g",
    portionMax: "100g", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Raisin", "Kiwi"] 
  },
  { 
    nom: "Orange / Clémentine", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 70,
    qn: 4,
    portionDefaut: "1 fruit",
    unite: "piece",
    kcalParUnite: 70,
    mesureRecommandee: "Unité",
    portionMax: "1 fruit", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Kiwi", "Pomme"] 
  },
  { 
    nom: "Mangue", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 80,
    qn: 4,
    portionDefaut: "½ mangue",
    unite: "portion",
    kcalParUnite: 80,
    mesureRecommandee: "Portion visuelle",
    portionMax: "½ fruit", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Ananas", "Papaye"] 
  },
  { 
    nom: "Kiwi", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 45,
    qn: 4,
    portionDefaut: "1 kiwi",
    unite: "piece",
    kcalParUnite: 45,
    mesureRecommandee: "Unité",
    portionMax: "1-2 kiwis", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Orange", "Fruits rouges"] 
  },
  { 
    nom: "Dattes / Figues sèches", 
    categorie: "fruit", 
    sousCategorie: "Fruits secs", 
    kcal: 120,
    qn: 4,
    portionDefaut: "2 unités",
    unite: "piece",
    kcalParUnite: 60,
    mesureRecommandee: "Unité",
    portionMax: "2 unités", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Abricots secs", "Pruneaux"] 
  },
  { 
    nom: "Kiwi", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 60,
    qn: 4,
    portionDefaut: "1 kiwi",
    unite: "piece",
    kcalParUnite: 60,
    mesureRecommandee: "Unité",
    portionMax: "1-2 kiwis", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Orange", "Fruits rouges"] 
  },
  { 
    nom: "Ananas (frais)", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 50,
    qn: 4,
    portionDefaut: "1 tranche (100g)",
    unite: "tranche",
    kcalParUnite: 50,
    mesureRecommandee: "Tranche",
    portionMax: "1-2 tranches", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Mangue", "Papaye"] 
  },
  { 
    nom: "Papaye", 
    categorie: "fruit", 
    sousCategorie: "Fruits frais", 
    kcal: 55,
    qn: 4,
    portionDefaut: "½ fruit (150g)",
    unite: "portion",
    kcalParUnite: 55,
    mesureRecommandee: "Portion visuelle",
    portionMax: "½ fruit", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Ananas", "Mangue"] 
  },
  { 
    nom: "Fraises", 
    categorie: "fruit", 
    sousCategorie: "Fruits rouges", 
    kcal: 35,
    qn: 4,
    portionDefaut: "100g (8-10 fraises)",
    unite: "portion",
    kcalParUnite: 35,
    mesureRecommandee: "Portion visuelle",
    portionMax: "150g", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Framboises", "Myrtilles"] 
  },
  { 
    nom: "Framboises", 
    categorie: "fruit", 
    sousCategorie: "Fruits rouges", 
    kcal: 40,
    qn: 4,
    portionDefaut: "100g",
    unite: "portion",
    kcalParUnite: 40,
    mesureRecommandee: "Portion visuelle",
    portionMax: "150g", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fraises", "Myrtilles"] 
  },
  { 
    nom: "Myrtilles", 
    categorie: "fruit", 
    sousCategorie: "Fruits rouges", 
    kcal: 50,
    qn: 4,
    portionDefaut: "100g",
    unite: "portion",
    kcalParUnite: 50,
    mesureRecommandee: "Portion visuelle",
    portionMax: "150g", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fraises", "Framboises"] 
  },
  { 
    nom: "Abricots (frais)", 
    categorie: "fruit", 
    sousCategorie: "Fruits à noyau", 
    kcal: 50,
    qn: 4,
    portionDefaut: "3 fruits",
    unite: "piece",
    kcalParUnite: 17,
    mesureRecommandee: "Unité",
    portionMax: "3 fruits", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Prunes", "Pêche"] 
  },
  { 
    nom: "Prunes", 
    categorie: "fruit", 
    sousCategorie: "Fruits à noyau", 
    kcal: 45,
    qn: 4,
    portionDefaut: "2 fruits",
    unite: "piece",
    kcalParUnite: 22,
    mesureRecommandee: "Unité",
    portionMax: "2-3 fruits", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Abricots", "Pêche"] 
  },
  { 
    nom: "Pêche", 
    categorie: "fruit", 
    sousCategorie: "Fruits à noyau", 
    kcal: 50,
    qn: 4,
    portionDefaut: "1 fruit",
    unite: "piece",
    kcalParUnite: 50,
    mesureRecommandee: "Unité",
    portionMax: "1 fruit", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Nectarine", "Abricots"] 
  },
  { 
    nom: "Nectarine", 
    categorie: "fruit", 
    sousCategorie: "Fruits à noyau", 
    kcal: 55,
    qn: 4,
    portionDefaut: "1 fruit",
    unite: "piece",
    kcalParUnite: 55,
    mesureRecommandee: "Unité",
    portionMax: "1 fruit", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Pêche", "Prunes"] 
  },

  // ═══════════════════════════════════════════════════════════
  // 🥑 GRAS VÉGÉTAL
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Avocat", 
    categorie: "gras_vegetal", 
    sousCategorie: "Fruits gras", 
    kcal: 140,
    qn: 4,
    portionDefaut: "½ fruit",
    unite: "portion",
    kcalParUnite: 140,
    mesureRecommandee: "Portion en ½",
    portionMax: "½ avocat", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Huile d'olive", "Noix"] 
  },
  { 
    nom: "Huile d'olive (crue)", 
    categorie: "gras_vegetal", 
    sousCategorie: "Huiles", 
    kcal: 90,
    qn: 4,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 90,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Huile de colza", "Huile de lin"] 
  },
  { 
    nom: "Purée d'amandes / noisette", 
    categorie: "gras_vegetal", 
    sousCategorie: "Purées oléagineuses", 
    kcal: 100,
    qn: 4,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 100,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Beurre de cacahuète", "Tahini"] 
  },
  { 
    nom: "Graines de chia", 
    categorie: "gras_vegetal", 
    sousCategorie: "Graines", 
    kcal: 60,
    qn: 4,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 60,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Graines de lin", "Graines de courge"] 
  },
  { 
    nom: "Noix / amandes / noisettes", 
    categorie: "gras_vegetal", 
    sousCategorie: "Oléagineux", 
    kcal: 75,
    qn: 4,
    portionDefaut: "10 unités",
    unite: "piece",
    kcalParUnite: 7.5,
    mesureRecommandee: "Unité (à la main)",
    portionMax: "10-15 unités", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Graines de courge", "Purée d'amandes"] 
  },
  { 
    nom: "Huile de coco", 
    categorie: "gras_vegetal", 
    sousCategorie: "Huiles", 
    kcal: 120,
    qn: 4,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 120,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Huile d'olive", "Beurre"] 
  },
  { 
    nom: "Huile de lin", 
    categorie: "gras_vegetal", 
    sousCategorie: "Huiles", 
    kcal: 120,
    qn: 4,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 120,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Huile d'olive", "Huile de colza"] 
  },
  { 
    nom: "Beurre de cacahuète", 
    categorie: "gras_vegetal", 
    sousCategorie: "Purées oléagineuses", 
    kcal: 95,
    qn: 4,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 95,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Purée d'amandes", "Tahini"] 
  },
  { 
    nom: "Purée d'amande", 
    categorie: "gras_vegetal", 
    sousCategorie: "Purées oléagineuses", 
    kcal: 100,
    qn: 4,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 100,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Beurre de cacahuète", "Purée noisette"] 
  },
  { 
    nom: "Graines de lin moulues", 
    categorie: "gras_vegetal", 
    sousCategorie: "Graines", 
    kcal: 55,
    qn: 4,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 55,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1-2 CS", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Graines de chia", "Graines de courge"] 
  },
  { 
    nom: "Graines de courge", 
    categorie: "gras_vegetal", 
    sousCategorie: "Graines", 
    kcal: 80,
    qn: 4,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 80,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Graines de tournesol", "Noix"] 
  },

  // ═══════════════════════════════════════════════════════════
  // 🍰 EXTRAS
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Chips", 
    categorie: "extra", 
    sousCategorie: "Snacks salés", 
    kcal: 130,
    qn: 1,
    portionDefaut: "1 poignée (25g)",
    unite: "portion",
    kcalParUnite: 130,
    mesureRecommandee: "Portion visuelle",
    portionMax: "25g", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Légumes crus", "Amandes"] 
  },
  { 
    nom: "Chocolat noir (70%)", 
    categorie: "extra", 
    sousCategorie: "Confiseries", 
    kcal: 30,
    qn: 1,
    portionDefaut: "1 carré (5g)",
    unite: "carre",
    kcalParUnite: 30,
    mesureRecommandee: "Carré",
    portionMax: "2-3 carrés", 
    typeRepas: "Collation", 
    moment: "Soir", 
    alternatives: ["Fruits secs", "Dattes"] 
  },
  { 
    nom: "Glace (vanille)", 
    categorie: "extra", 
    sousCategorie: "Desserts glacés", 
    kcal: 120,
    qn: 1,
    portionDefaut: "1 boule (60g)",
    unite: "boule",
    kcalParUnite: 120,
    mesureRecommandee: "Boule",
    portionMax: "1-2 boules", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Sorbet", "Yaourt glacé"] 
  },
  { 
    nom: "Viennoiserie", 
    categorie: "extra", 
    sousCategorie: "Viennoiseries", 
    kcal: 400,
    qn: 1,
    portionDefaut: "1 pain au chocolat",
    unite: "piece",
    kcalParUnite: 400,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet", "Céréales"] 
  },
  { 
    nom: "Fast food (burger + frites)", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 900,
    qn: 1,
    portionDefaut: "1 combo",
    unite: "combo",
    kcalParUnite: 900,
    mesureRecommandee: "Unité (combo)",
    portionMax: "1 menu", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Repas équilibré maison"] 
  },
  { 
    nom: "Sauce industrielle", 
    categorie: "extra", 
    sousCategorie: "Sauces", 
    kcal: 80,
    qn: 1,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 80,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Sauce maison", "Huile d'olive + épices"] 
  },
  { 
    nom: "Nutella / pâte à tartiner", 
    categorie: "extra", 
    sousCategorie: "Pâtes à tartiner", 
    kcal: 100,
    qn: 1,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 100,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Purée d'amandes", "Confiture maison"] 
  },
  { 
    nom: "Soda sucré", 
    categorie: "extra", 
    sousCategorie: "Boissons sucrées", 
    kcal: 85,
    qn: 1,
    portionDefaut: "1 verre (200ml)",
    unite: "verre",
    kcalParUnite: 85,
    mesureRecommandee: "Portion liquide",
    portionMax: "200ml", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Eau", "Eau citronnée", "Infusion"] 
  },

  // BONBONS & CONFISERIES
  { 
    nom: "Chewing-gum avec sucre", 
    categorie: "extra", 
    sousCategorie: "Bonbons", 
    kcal: 10,
    qn: 1,
    portionDefaut: "1 chewing-gum",
    unite: "piece",
    kcalParUnite: 10,
    mesureRecommandee: "Unité",
    portionMax: "2 pièces", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Chewing-gum sans sucre"] 
  },
  { 
    nom: "Chewing-gum sans sucre", 
    categorie: "extra", 
    sousCategorie: "Bonbons", 
    kcal: 5,
    qn: 1,
    portionDefaut: "1 chewing-gum",
    unite: "piece",
    kcalParUnite: 5,
    mesureRecommandee: "Unité",
    portionMax: "Illimité", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Menthe fraîche"] 
  },
  { 
    nom: "Sucette", 
    categorie: "extra", 
    sousCategorie: "Bonbons", 
    kcal: 50,
    qn: 1,
    portionDefaut: "1 sucette",
    unite: "piece",
    kcalParUnite: 50,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruit frais"] 
  },
  { 
    nom: "Bonbons gélifiés (Haribo)", 
    categorie: "extra", 
    sousCategorie: "Bonbons", 
    kcal: 140,
    qn: 1,
    portionDefaut: "1 petit sachet (40g)",
    unite: "sachet",
    kcalParUnite: 140,
    mesureRecommandee: "Portion visuelle",
    portionMax: "1 sachet", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruits secs", "Dattes"] 
  },
  { 
    nom: "Caramels", 
    categorie: "extra", 
    sousCategorie: "Bonbons", 
    kcal: 40,
    qn: 1,
    portionDefaut: "1 caramel (10g)",
    unite: "piece",
    kcalParUnite: 40,
    mesureRecommandee: "Unité",
    portionMax: "2-3 pièces", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Datte", "Pruneau"] 
  },
  { 
    nom: "Réglisse", 
    categorie: "extra", 
    sousCategorie: "Bonbons", 
    kcal: 30,
    qn: 1,
    portionDefaut: "1 bâton",
    unite: "piece",
    kcalParUnite: 30,
    mesureRecommandee: "Unité",
    portionMax: "2 bâtons", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruits secs"] 
  },
  { 
    nom: "Dragées", 
    categorie: "extra", 
    sousCategorie: "Bonbons", 
    kcal: 120,
    qn: 1,
    portionDefaut: "1 poignée (30g)",
    unite: "portion",
    kcalParUnite: 120,
    mesureRecommandee: "Portion visuelle",
    portionMax: "30g", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Amandes"] 
  },

  // BISCUITS INDUSTRIELS
  { 
    nom: "Prince (Lu)", 
    categorie: "extra", 
    sousCategorie: "Biscuits industriels", 
    kcal: 135,
    qn: 1,
    portionDefaut: "1 biscuit (2 barres)",
    unite: "piece",
    kcalParUnite: 135,
    mesureRecommandee: "Unité",
    portionMax: "1 biscuit", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Biscuit maison", "Pain complet"] 
  },
  { 
    nom: "Petit Beurre (Lu)", 
    categorie: "extra", 
    sousCategorie: "Biscuits industriels", 
    kcal: 120,
    qn: 1,
    portionDefaut: "3 biscuits (25g)",
    unite: "portion",
    kcalParUnite: 120,
    mesureRecommandee: "Portion visuelle",
    portionMax: "3 biscuits", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Biscuit maison"] 
  },
  { 
    nom: "Oreo", 
    categorie: "extra", 
    sousCategorie: "Biscuits industriels", 
    kcal: 160,
    qn: 1,
    portionDefaut: "3 biscuits (34g)",
    unite: "portion",
    kcalParUnite: 160,
    mesureRecommandee: "Portion visuelle",
    portionMax: "3 biscuits", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Chocolat noir"] 
  },
  { 
    nom: "Biscuits fourrés (BN)", 
    categorie: "extra", 
    sousCategorie: "Biscuits industriels", 
    kcal: 90,
    qn: 1,
    portionDefaut: "1 biscuit (22g)",
    unite: "piece",
    kcalParUnite: 90,
    mesureRecommandee: "Unité",
    portionMax: "2 biscuits", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruit frais"] 
  },
  { 
    nom: "Spéculoos", 
    categorie: "extra", 
    sousCategorie: "Biscuits industriels", 
    kcal: 140,
    qn: 1,
    portionDefaut: "4 biscuits (28g)",
    unite: "portion",
    kcalParUnite: 140,
    mesureRecommandee: "Portion visuelle",
    portionMax: "4 biscuits", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Pain d'épices maison"] 
  },
  { 
    nom: "Galettes bretonnes", 
    categorie: "extra", 
    sousCategorie: "Biscuits industriels", 
    kcal: 150,
    qn: 1,
    portionDefaut: "2 galettes (30g)",
    unite: "portion",
    kcalParUnite: 150,
    mesureRecommandee: "Portion visuelle",
    portionMax: "2 galettes", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Biscuit maison"] 
  },

  // VIENNOISERIES DÉTAILLÉES
  { 
    nom: "Croissant", 
    categorie: "viennoiserie", 
    sousCategorie: "Viennoiserie feuilletée", 
    kcal: 317,
    qn: 1,
    portionDefaut: "1 croissant (78g)",
    unite: "piece",
    kcalParUnite: 317,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet"] 
  },
  { 
    nom: "Pain au chocolat", 
    categorie: "viennoiserie", 
    sousCategorie: "Viennoiserie feuilletée", 
    kcal: 412,
    qn: 1,
    portionDefaut: "1 pain au chocolat (98g)",
    unite: "piece",
    kcalParUnite: 412,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet + chocolat noir"] 
  },
  { 
    nom: "Pain aux raisins", 
    categorie: "viennoiserie", 
    sousCategorie: "Viennoiserie fourrée", 
    kcal: 390,
    qn: 1,
    portionDefaut: "1 pain aux raisins (117g)",
    unite: "piece",
    kcalParUnite: 390,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet + raisins secs"] 
  },
  { 
    nom: "Chausson aux pommes", 
    categorie: "viennoiserie", 
    sousCategorie: "Viennoiserie fourrée", 
    kcal: 417,
    qn: 1,
    portionDefaut: "1 chausson (124g)",
    unite: "piece",
    kcalParUnite: 417,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pomme au four"] 
  },
  { 
    nom: "Brioche", 
    categorie: "viennoiserie", 
    sousCategorie: "Viennoiserie briochée", 
    kcal: 194,
    qn: 1,
    portionDefaut: "1 tranche (52g)",
    unite: "tranche",
    kcalParUnite: 194,
    mesureRecommandee: "Tranche",
    portionMax: "2 tranches", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Pain complet"] 
  },
  {
    nom: "Brioche au sucre",
    categorie: "viennoiserie",
    sousCategorie: "Viennoiserie briochée",
    kcal: 346,
    qn: 1,
    portionDefaut: "1 pièce (91g)",
    unite: "piece",
    kcalParUnite: 346,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce",
    typeRepas: "Petit-déjeuner",
    moment: "Matin",
    alternatives: ["Brioche", "Pain complet"]
  },
  {
    nom: "Brioche feuilletée",
    categorie: "viennoiserie",
    sousCategorie: "Viennoiserie briochée",
    kcal: 519,
    qn: 1,
    portionDefaut: "1 pièce (124g)",
    unite: "piece",
    kcalParUnite: 519,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce",
    typeRepas: "Petit-déjeuner",
    moment: "Matin",
    alternatives: ["Croissant", "Brioche au sucre"]
  },
  {
    nom: "Palmier",
    categorie: "viennoiserie",
    sousCategorie: "Viennoiserie sucrée classique",
    kcal: 208,
    qn: 1,
    portionDefaut: "1 pièce (52g)",
    unite: "piece",
    kcalParUnite: 208,
    mesureRecommandee: "Unité",
    portionMax: "2 pièces",
    typeRepas: "Collation",
    moment: "Après-midi",
    alternatives: ["Torsade chocolat", "Pain aux raisins"]
  },
  {
    nom: "Torsade chocolat",
    categorie: "viennoiserie",
    sousCategorie: "Viennoiserie fourrée",
    kcal: 527,
    qn: 1,
    portionDefaut: "1 pièce (130g)",
    unite: "piece",
    kcalParUnite: 527,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce",
    typeRepas: "Petit-déjeuner",
    moment: "Matin",
    alternatives: ["Pain au chocolat", "Palmier"]
  },
  {
    nom: "Suisse (crème pépites)",
    categorie: "viennoiserie",
    sousCategorie: "Viennoiserie fourrée",
    kcal: 515,
    qn: 1,
    portionDefaut: "1 pièce (143g)",
    unite: "piece",
    kcalParUnite: 515,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce",
    typeRepas: "Petit-déjeuner",
    moment: "Matin",
    alternatives: ["Brioche feuilletée", "Pain aux raisins"]
  },

  // PÂTISSERIES BOULANGERIE
  { 
    nom: "Éclair au chocolat", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 260,
    qn: 1,
    portionDefaut: "1 éclair",
    unite: "piece",
    kcalParUnite: 260,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Yaourt nature + cacao"] 
  },
  { 
    nom: "Mille-feuille", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 340,
    qn: 1,
    portionDefaut: "1 part",
    unite: "part",
    kcalParUnite: 340,
    mesureRecommandee: "Unité",
    portionMax: "1 part", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Compote maison"] 
  },
  { 
    nom: "Tarte aux fruits", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 280,
    qn: 1,
    portionDefaut: "1 part",
    unite: "part",
    kcalParUnite: 280,
    mesureRecommandee: "Unité",
    portionMax: "1 part", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruits frais"] 
  },
  { 
    nom: "Paris-Brest", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 420,
    qn: 1,
    portionDefaut: "1 part",
    unite: "part",
    kcalParUnite: 420,
    mesureRecommandee: "Unité",
    portionMax: "1 part", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Yaourt grec + noix"] 
  },
  { 
    nom: "Religieuse", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 380,
    qn: 1,
    portionDefaut: "1 religieuse",
    unite: "piece",
    kcalParUnite: 380,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Yaourt nature"] 
  },
  { 
    nom: "Macaron", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 90,
    qn: 1,
    portionDefaut: "1 macaron",
    unite: "piece",
    kcalParUnite: 90,
    mesureRecommandee: "Unité",
    portionMax: "2 pièces", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruit frais"] 
  },
  { 
    nom: "Financier", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 140,
    qn: 1,
    portionDefaut: "1 financier",
    unite: "piece",
    kcalParUnite: 140,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Amandes"] 
  },
  { 
    nom: "Cannelé", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 110,
    qn: 1,
    portionDefaut: "1 cannelé",
    unite: "piece",
    kcalParUnite: 110,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruit frais"] 
  },
  { 
    nom: "Chouquette", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 25,
    qn: 1,
    portionDefaut: "1 chouquette",
    unite: "piece",
    kcalParUnite: 25,
    mesureRecommandee: "Unité",
    portionMax: "5 pièces", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruit sec"] 
  },
  { 
    nom: "Gâteau au chocolat (fait maison)", 
    categorie: "extra", 
    sousCategorie: "Pâtisseries", 
    kcal: 320,
    qn: 1,
    portionDefaut: "1 part",
    unite: "part",
    kcalParUnite: 320,
    mesureRecommandee: "Unité",
    portionMax: "1 part", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Compote chocolat"] 
  },

  // FAST FOOD DÉTAILLÉ
  { 
    nom: "Pizza (part)", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 250,
    qn: 1,
    portionDefaut: "1 part (1/8 pizza)",
    unite: "part",
    kcalParUnite: 250,
    mesureRecommandee: "Portion visuelle",
    portionMax: "2 parts", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pizza maison légère"] 
  },
  { 
    nom: "Pizza complète", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 2000,
    qn: 1,
    portionDefaut: "1 pizza entière",
    unite: "piece",
    kcalParUnite: 2000,
    mesureRecommandee: "Unité",
    portionMax: "1/2 pizza", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Pizza maison partagée"] 
  },
  { 
    nom: "Tacos", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 700,
    qn: 1,
    portionDefaut: "1 tacos",
    unite: "piece",
    kcalParUnite: 700,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Wrap maison équilibré"] 
  },
  { 
    nom: "Kebab / Döner", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 800,
    qn: 1,
    portionDefaut: "1 kebab",
    unite: "piece",
    kcalParUnite: 800,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Viande grillée + salade maison"] 
  },
  { 
    nom: "Nuggets (McDo)", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 180,
    qn: 1,
    portionDefaut: "6 nuggets",
    unite: "portion",
    kcalParUnite: 180,
    mesureRecommandee: "Portion visuelle",
    portionMax: "6 pièces", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Poulet grillé maison"] 
  },
  { 
    nom: "Frites (McDo)", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 340,
    qn: 1,
    portionDefaut: "1 moyenne",
    unite: "portion",
    kcalParUnite: 340,
    mesureRecommandee: "Portion visuelle",
    portionMax: "1 moyenne", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Patates douces au four"] 
  },
  { 
    nom: "Hot-dog", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 300,
    qn: 1,
    portionDefaut: "1 hot-dog",
    unite: "piece",
    kcalParUnite: 300,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Sandwich maison"] 
  },
  { 
    nom: "Sandwich jambon-beurre", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 280,
    qn: 1,
    portionDefaut: "1 sandwich",
    unite: "piece",
    kcalParUnite: 280,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Sandwich pain complet + protéine"] 
  },
  { 
    nom: "Panini", 
    categorie: "extra", 
    sousCategorie: "Fast food", 
    kcal: 500,
    qn: 1,
    portionDefaut: "1 panini",
    unite: "piece",
    kcalParUnite: 500,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Déjeuner", 
    moment: "Midi", 
    alternatives: ["Sandwich maison"] 
  },

  // DESSERTS & GLACES DÉTAILLÉS
  { 
    nom: "Glace chocolat", 
    categorie: "extra", 
    sousCategorie: "Desserts glacés", 
    kcal: 140,
    qn: 1,
    portionDefaut: "1 boule (60g)",
    unite: "boule",
    kcalParUnite: 140,
    mesureRecommandee: "Boule",
    portionMax: "1-2 boules", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Sorbet fruits"] 
  },
  { 
    nom: "Sorbet fruits", 
    categorie: "extra", 
    sousCategorie: "Desserts glacés", 
    kcal: 80,
    qn: 1,
    portionDefaut: "1 boule (60g)",
    unite: "boule",
    kcalParUnite: 80,
    mesureRecommandee: "Boule",
    portionMax: "2 boules", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruit frais mixé"] 
  },
  { 
    nom: "Esquimau / Bâtonnet glacé", 
    categorie: "extra", 
    sousCategorie: "Desserts glacés", 
    kcal: 100,
    qn: 1,
    portionDefaut: "1 bâtonnet",
    unite: "piece",
    kcalParUnite: 100,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Fruit congelé"] 
  },
  { 
    nom: "Magnum", 
    categorie: "extra", 
    sousCategorie: "Desserts glacés", 
    kcal: 280,
    qn: 1,
    portionDefaut: "1 magnum",
    unite: "piece",
    kcalParUnite: 280,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Yaourt glacé maison"] 
  },
  { 
    nom: "Sundae (McDo)", 
    categorie: "extra", 
    sousCategorie: "Desserts glacés", 
    kcal: 330,
    qn: 1,
    portionDefaut: "1 sundae",
    unite: "piece",
    kcalParUnite: 330,
    mesureRecommandee: "Unité",
    portionMax: "1 pièce", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Yaourt nature + fruits"] 
  },

  // SNACKS SALÉS SUPPLÉMENTAIRES
  { 
    nom: "Cacahuètes salées", 
    categorie: "extra", 
    sousCategorie: "Snacks salés", 
    kcal: 170,
    qn: 1,
    portionDefaut: "1 poignée (30g)",
    unite: "portion",
    kcalParUnite: 170,
    mesureRecommandee: "Portion visuelle",
    portionMax: "30g", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Amandes nature"] 
  },
  { 
    nom: "Biscuits apéritif (Tuc)", 
    categorie: "extra", 
    sousCategorie: "Snacks salés", 
    kcal: 130,
    qn: 1,
    portionDefaut: "5 biscuits (25g)",
    unite: "portion",
    kcalParUnite: 130,
    mesureRecommandee: "Portion visuelle",
    portionMax: "25g", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Légumes crus"] 
  },
  { 
    nom: "Pop-corn salé", 
    categorie: "extra", 
    sousCategorie: "Snacks salés", 
    kcal: 150,
    qn: 1,
    portionDefaut: "1 bol (30g)",
    unite: "bol",
    kcalParUnite: 150,
    mesureRecommandee: "Portion visuelle",
    portionMax: "1 bol", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Pop-corn maison sans sel"] 
  },
  { 
    nom: "Bretzel", 
    categorie: "extra", 
    sousCategorie: "Snacks salés", 
    kcal: 80,
    qn: 1,
    portionDefaut: "1 bretzel",
    unite: "piece",
    kcalParUnite: 80,
    mesureRecommandee: "Unité",
    portionMax: "2 pièces", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Pain complet"] 
  },

  // BOISSONS SUPPLÉMENTAIRES
  { 
    nom: "Jus de fruits industriel", 
    categorie: "extra", 
    sousCategorie: "Boissons sucrées", 
    kcal: 110,
    qn: 1,
    portionDefaut: "1 verre (250ml)",
    unite: "verre",
    kcalParUnite: 110,
    mesureRecommandee: "Portion liquide",
    portionMax: "250ml", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Fruit pressé maison", "Fruit entier"] 
  },
  { 
    nom: "Smoothie industriel", 
    categorie: "extra", 
    sousCategorie: "Boissons sucrées", 
    kcal: 150,
    qn: 1,
    portionDefaut: "1 bouteille (250ml)",
    unite: "bouteille",
    kcalParUnite: 150,
    mesureRecommandee: "Portion liquide",
    portionMax: "250ml", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Smoothie maison sans sucre ajouté"] 
  },
  { 
    nom: "Boisson énergisante (Red Bull)", 
    categorie: "extra", 
    sousCategorie: "Boissons sucrées", 
    kcal: 110,
    qn: 1,
    portionDefaut: "1 canette (250ml)",
    unite: "canette",
    kcalParUnite: 110,
    mesureRecommandee: "Portion liquide",
    portionMax: "1 canette", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Thé vert", "Café"] 
  },
  { 
    nom: "Café sucré (latte sucré)", 
    categorie: "extra", 
    sousCategorie: "Boissons sucrées", 
    kcal: 180,
    qn: 1,
    portionDefaut: "1 grande tasse (350ml)",
    unite: "tasse",
    kcalParUnite: 180,
    mesureRecommandee: "Portion liquide",
    portionMax: "1 tasse", 
    typeRepas: "Collation", 
    moment: "Matin", 
    alternatives: ["Café noir", "Café lait sans sucre"] 
  },

  // AUTRES EXTRAS
  { 
    nom: "Barres chocolatées (Mars, Snickers)", 
    categorie: "extra", 
    sousCategorie: "Confiseries", 
    kcal: 230,
    qn: 1,
    portionDefaut: "1 barre (50g)",
    unite: "barre",
    kcalParUnite: 230,
    mesureRecommandee: "Unité",
    portionMax: "1 barre", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Barre énergétique maison", "Fruits secs + noix"] 
  },
  { 
    nom: "Kinder Bueno", 
    categorie: "extra", 
    sousCategorie: "Confiseries", 
    kcal: 122,
    qn: 1,
    portionDefaut: "1 barre (21.5g)",
    unite: "barre",
    kcalParUnite: 122,
    mesureRecommandee: "Unité",
    portionMax: "1 barre", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Chocolat noir + noisettes"] 
  },
  { 
    nom: "Twix", 
    categorie: "extra", 
    sousCategorie: "Confiseries", 
    kcal: 250,
    qn: 1,
    portionDefaut: "1 barre (50g)",
    unite: "barre",
    kcalParUnite: 250,
    mesureRecommandee: "Unité",
    portionMax: "1 barre", 
    typeRepas: "Collation", 
    moment: "Après-midi", 
    alternatives: ["Dattes + amandes"] 
  },
  { 
    nom: "Céréales sucrées (Chocapic, Frosties)", 
    categorie: "extra", 
    sousCategorie: "Céréales industrielles", 
    kcal: 150,
    qn: 1,
    portionDefaut: "1 bol (40g)",
    unite: "bol",
    kcalParUnite: 150,
    mesureRecommandee: "Portion visuelle",
    portionMax: "1 bol", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Flocons d'avoine", "Muesli maison"] 
  },
  { 
    nom: "Pâte à tartiner (autre que Nutella)", 
    categorie: "extra", 
    sousCategorie: "Pâtes à tartiner", 
    kcal: 100,
    qn: 1,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 100,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "1 CS", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Purée d'amandes", "Purée de noisettes"] 
  },
  { 
    nom: "Confiture industrielle", 
    categorie: "extra", 
    sousCategorie: "Pâtes à tartiner", 
    kcal: 50,
    qn: 1,
    portionDefaut: "1 CS",
    unite: "CS",
    kcalParUnite: 50,
    mesureRecommandee: "Cuillère à soupe",
    portionMax: "2 CS", 
    typeRepas: "Petit-déjeuner", 
    moment: "Matin", 
    alternatives: ["Confiture maison", "Compote sans sucre"] 
  },
];

// ENRICHISSEMENT 2025-11-20 : Ajout des aliments manquants et chaînes
const correctifsAliments = [
  // Boissons
  { nom: "Coca-Cola", categorie: "boisson", sousCategorie: "Soda", marque: "Coca-Cola", kcal: 42, qn: 1, portionDefaut: "100ml", unite: "ml", alternatives: ["Pepsi", "Fanta"] },
  { nom: "Pepsi", categorie: "boisson", sousCategorie: "Soda", marque: "Pepsi", kcal: 41, qn: 1, portionDefaut: "100ml", unite: "ml", alternatives: ["Coca-Cola", "Fanta"] },
  { nom: "Fanta", categorie: "boisson", sousCategorie: "Soda", marque: "Fanta", kcal: 40, qn: 1, portionDefaut: "100ml", unite: "ml", alternatives: ["Coca-Cola", "Pepsi"] },
  { nom: "Fuze Tea", categorie: "boisson", sousCategorie: "Thé glacé", marque: "Fuze Tea", kcal: 19, qn: 1, portionDefaut: "100ml", unite: "ml", alternatives: ["Ice Tea", "Freeze"] },
  { nom: "Freeze", categorie: "boisson", sousCategorie: "Soda", marque: "Freeze", kcal: 40, qn: 1, portionDefaut: "100ml", unite: "ml", alternatives: ["Fanta", "Pepsi"] },

  // Snacks cinéma
  { nom: "Popcorn sucré cinéma", categorie: "snack", sousCategorie: "Popcorn", marque: null, kcal: 420, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Popcorn salé", "Nachos"] },

  // Glaces
  { nom: "Glace vanille Häagen-Dazs", categorie: "snack", sousCategorie: "Glace", marque: "Häagen-Dazs", kcal: 210, qn: 2, portionDefaut: "100ml", unite: "ml", alternatives: ["Glace chocolat Häagen-Dazs", "Glace Ben & Jerry’s"] },
  { nom: "Glace chocolat Häagen-Dazs", categorie: "snack", sousCategorie: "Glace", marque: "Häagen-Dazs", kcal: 220, qn: 2, portionDefaut: "100ml", unite: "ml", alternatives: ["Glace vanille Häagen-Dazs", "Glace Ben & Jerry’s"] },
  { nom: "Glace fraise Magnum", categorie: "snack", sousCategorie: "Glace", marque: "Magnum", kcal: 230, qn: 2, portionDefaut: "100ml", unite: "ml", alternatives: ["Glace vanille Magnum", "Glace Ben & Jerry’s"] },

  // Cuisine asiatique et chaînes
  { nom: "Bo Bun", categorie: "asiatique", sousCategorie: "Vietnamien", marque: null, kcal: 480, qn: 2, portionDefaut: "1 bol", unite: "bol", alternatives: ["Pho", "Nem"] },
  { nom: "Pho", categorie: "asiatique", sousCategorie: "Vietnamien", marque: null, kcal: 350, qn: 2, portionDefaut: "1 bol", unite: "bol", alternatives: ["Bo Bun", "Nem"] },
  { nom: "Pad Thaï", categorie: "asiatique", sousCategorie: "Thaï", marque: null, kcal: 550, qn: 2, portionDefaut: "1 assiette", unite: "assiette", alternatives: ["Bo Bun", "Nouilles sautées"] },
  { nom: "Gyoza", categorie: "asiatique", sousCategorie: "Entrée", marque: null, kcal: 50, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Tempura", "Spring roll"] },
  { nom: "Tempura", categorie: "asiatique", sousCategorie: "Entrée", marque: null, kcal: 60, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Gyoza", "Spring roll"] },

  // Chaînes de restauration rapide
  { nom: "Big Mac", categorie: "fast-food", sousCategorie: "Burger", marque: "McDonald’s", kcal: 503, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["McChicken", "Whopper"] },
  { nom: "Subway Sub", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 350, qn: 1, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Wrap Subway", "Salade Subway"] },
  { nom: "Pitaya wok", categorie: "asiatique", sousCategorie: "Wok asiatique", marque: "Pitaya", kcal: 600, qn: 2, portionDefaut: "1 box", unite: "box", alternatives: ["Pad Thaï", "Bo Bun"] },
  { nom: "Class’Croute sandwich", categorie: "traiteur", sousCategorie: "Sandwich", marque: "Class’Croute", kcal: 320, qn: 1, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Salade Class’Croute", "Wrap Class’Croute"] },
  { nom: "Wrap KFC", categorie: "fast-food", sousCategorie: "Wrap", marque: "KFC", kcal: 420, qn: 1, portionDefaut: "1 wrap", unite: "piece", alternatives: ["Tacos O’Tacos", "Subway Sub"] },
  { nom: "Pizza Domino’s", categorie: "fast-food", sousCategorie: "Pizza", marque: "Domino’s Pizza", kcal: 250, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Pepperoni", "Pizza 4 fromages"] },

  // Pizza Hut (6 plats)
  { nom: "Pizza Hut Pepperoni", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 280, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut 4 fromages", "Pizza Domino's"] },
  { nom: "Pizza Hut 4 fromages", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 270, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Pepperoni", "Pizza Margherita"] },
  { nom: "Pizza Hut Margherita", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 220, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut 4 fromages", "Pizza Hut Végétarienne"] },
  { nom: "Pizza Hut Végétarienne", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 240, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Margherita", "Pizza Hut Suprême"] },
  { nom: "Pizza Hut Suprême", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 310, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Végétarienne", "Pizza Hut Pepperoni"] },
  { nom: "Pizza Hut Poulet BBQ", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 290, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Suprême", "Pizza Hut Pepperoni"] },

  // Quick (10 plats)
  { nom: "Quick Giant", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 600, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Big Mac", "Whopper"] },
  { nom: "Quick Long Bacon", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 530, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Quick Giant", "Big Mac"] },
  { nom: "Quick Long Chicken", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 480, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["McChicken", "KFC Wrap"] },
  { nom: "Quick Magic", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 400, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Cheeseburger", "Hamburger"] },
  { nom: "Quick Supreme Cheese", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 550, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Quick Giant", "Big Mac"] },
  { nom: "Quick Fish", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 420, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Filet-O-Fish", "Subway Sub"] },
  { nom: "Quick Veggie", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 380, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Burger végétarien", "Subway Sub"] },
  { nom: "Quick Nuggets (6 pièces)", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Quick", kcal: 280, qn: 1, portionDefaut: "6 pièces", unite: "portion", alternatives: ["McNuggets", "KFC Tenders"] },
  { nom: "Quick Frites Moyenne", categorie: "fast-food", sousCategorie: "Frites", marque: "Quick", kcal: 320, qn: 1, portionDefaut: "portion", unite: "portion", alternatives: ["Frites McDonald's", "Frites Burger King"] },
  { nom: "Quick Shake Vanille", categorie: "fast-food", sousCategorie: "Boisson", marque: "Quick", kcal: 350, qn: 1, portionDefaut: "1 verre", unite: "verre", alternatives: ["McFlurry", "Milkshake"] },

  // O'Tacos (5 plats)
  { nom: "O'Tacos M", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 680, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["O'Tacos L", "Wrap KFC"] },
  { nom: "O'Tacos L", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 850, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["O'Tacos XL", "O'Tacos M"] },
  { nom: "O'Tacos XL", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 1020, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["O'Tacos L", "O'Tacos M"] },
  { nom: "O'Tacos Box Tenders", categorie: "fast-food", sousCategorie: "Tenders", marque: "O'Tacos", kcal: 580, qn: 1, portionDefaut: "1 box", unite: "portion", alternatives: ["KFC Tenders", "McNuggets"] },
  { nom: "O'Tacos Frites Fromage", categorie: "fast-food", sousCategorie: "Frites", marque: "O'Tacos", kcal: 480, qn: 1, portionDefaut: "portion", unite: "portion", alternatives: ["Frites McDonald's", "Quick Frites"] },

  // Kebab (3 plats)
  { nom: "Kebab sandwich", categorie: "fast-food", sousCategorie: "Kebab", marque: "Kebab", kcal: 550, qn: 1, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Kebab assiette", "Kebab galette"] },
  { nom: "Kebab assiette", categorie: "fast-food", sousCategorie: "Kebab", marque: "Kebab", kcal: 700, qn: 1, portionDefaut: "1 assiette", unite: "assiette", alternatives: ["Kebab sandwich", "Kebab galette"] },
  { nom: "Kebab galette", categorie: "fast-food", sousCategorie: "Kebab", marque: "Kebab", kcal: 580, qn: 1, portionDefaut: "1 galette", unite: "piece", alternatives: ["Kebab sandwich", "Kebab assiette"] },

  // Pizza Hut (6 plats)
  { nom: "Pizza Hut Pepperoni", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 280, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut 4 fromages", "Pizza Domino's"] },
  { nom: "Pizza Hut 4 fromages", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 270, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Pepperoni", "Pizza Margherita"] },
  { nom: "Pizza Hut Margherita", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 220, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut 4 fromages", "Pizza Hut Végétarienne"] },
  { nom: "Pizza Hut Végétarienne", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 240, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Margherita", "Pizza Hut Suprême"] },
  { nom: "Pizza Hut Suprême", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 310, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Végétarienne", "Pizza Hut Pepperoni"] },
  { nom: "Pizza Hut Poulet BBQ", categorie: "fast-food", sousCategorie: "Pizza", marque: "Pizza Hut", kcal: 290, qn: 1, portionDefaut: "1 part", unite: "part", alternatives: ["Pizza Hut Suprême", "Pizza Hut Pepperoni"] },

  // Quick (10 plats)
  { nom: "Quick Giant", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 600, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Big Mac", "Whopper"] },
  { nom: "Quick Long Bacon", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 530, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Quick Giant", "Big Mac"] },
  { nom: "Quick Long Chicken", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 480, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["McChicken", "KFC Wrap"] },
  { nom: "Quick Magic", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 400, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Cheeseburger", "Hamburger"] },
  { nom: "Quick Supreme Cheese", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 550, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Quick Giant", "Big Mac"] },
  { nom: "Quick Fish", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 420, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Filet-O-Fish", "Subway Sub"] },
  { nom: "Quick Veggie", categorie: "fast-food", sousCategorie: "Burger", marque: "Quick", kcal: 380, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Burger végétarien", "Subway Sub"] },
  { nom: "Quick Nuggets (6 pièces)", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Quick", kcal: 280, qn: 1, portionDefaut: "6 pièces", unite: "portion", alternatives: ["McNuggets", "KFC Tenders"] },
  { nom: "Quick Frites Moyenne", categorie: "fast-food", sousCategorie: "Frites", marque: "Quick", kcal: 320, qn: 1, portionDefaut: "portion", unite: "portion", alternatives: ["Frites McDonald's", "Frites Burger King"] },
  { nom: "Quick Shake Vanille", categorie: "fast-food", sousCategorie: "Boisson", marque: "Quick", kcal: 350, qn: 1, portionDefaut: "1 verre", unite: "verre", alternatives: ["McFlurry", "Milkshake"] },

  // O'Tacos (5 plats)
  { nom: "O'Tacos M", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 680, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["O'Tacos L", "Wrap KFC"] },
  { nom: "O'Tacos L", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 850, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["O'Tacos XL", "O'Tacos M"] },
  { nom: "O'Tacos XL", categorie: "fast-food", sousCategorie: "Tacos", marque: "O'Tacos", kcal: 1020, qn: 1, portionDefaut: "1 tacos", unite: "piece", alternatives: ["O'Tacos L", "O'Tacos M"] },
  { nom: "O'Tacos Box Tenders", categorie: "fast-food", sousCategorie: "Tenders", marque: "O'Tacos", kcal: 580, qn: 1, portionDefaut: "1 box", unite: "portion", alternatives: ["KFC Tenders", "McNuggets"] },
  { nom: "O'Tacos Frites Fromage", categorie: "fast-food", sousCategorie: "Frites", marque: "O'Tacos", kcal: 480, qn: 1, portionDefaut: "portion", unite: "portion", alternatives: ["Frites McDonald's", "Quick Frites"] },

  // Kebab (3 plats)
  { nom: "Kebab sandwich", categorie: "fast-food", sousCategorie: "Kebab", marque: "Kebab", kcal: 550, qn: 1, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Kebab assiette", "Kebab galette"] },
  { nom: "Kebab assiette", categorie: "fast-food", sousCategorie: "Kebab", marque: "Kebab", kcal: 700, qn: 1, portionDefaut: "1 assiette", unite: "assiette", alternatives: ["Kebab sandwich", "Kebab galette"] },
  { nom: "Kebab galette", categorie: "fast-food", sousCategorie: "Kebab", marque: "Kebab", kcal: 580, qn: 1, portionDefaut: "1 galette", unite: "piece", alternatives: ["Kebab sandwich", "Kebab assiette"] },

  // Buffet chinois
  { nom: "Nems au porc", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 90, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Nems aux crevettes", "Samoussa"] },
  { nom: "Nems aux crevettes", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 85, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Nems au porc", "Samoussa"] },
  { nom: "Samoussa", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 80, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Nems", "Raviolis vapeur"] },
  { nom: "Raviolis vapeur", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 60, qn: 2, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Dim sum", "Brioche vapeur"] },
  { nom: "Brioche vapeur au porc", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 120, qn: 2, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Brioche vapeur végétarienne", "Raviolis vapeur"] },
  { nom: "Poulet caramel", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 180, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Poulet citron", "Porc au caramel"] },
  { nom: "Porc au caramel", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 200, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Poulet caramel", "Canard laqué"] },
  { nom: "Canard laqué", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 220, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Porc au caramel", "Poulet caramel"] },
  { nom: "Nouilles sautées", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 150, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Riz cantonais", "Riz nature"] },
  { nom: "Riz cantonais", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 140, qn: 2, portionDefaut: "100g", unite: "g", alternatives: ["Nouilles sautées", "Riz nature"] },
  { nom: "Crevettes sauce piquante", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 90, qn: 2, portionDefaut: "50g", unite: "g", alternatives: ["Crevettes sautées", "Poulet piquant"] },
  { nom: "Nouilles sautées crevettes", categorie: "asiatique", sousCategorie: "Buffet chinois", marque: null, kcal: 450, qn: 2, portionDefaut: "250g", unite: "g", alternatives: ["Nouilles sautées", "Pad Thaï"] },

  // === MCDONALD'S === (Enrichissement 2026-01-07)
  // Burgers
  { nom: "McChicken", categorie: "fast-food", sousCategorie: "Burger", marque: "McDonald's", kcal: 400, kcalParUnite: 400, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Big Mac", "Royal Cheese"] },
  { nom: "Royal Deluxe", categorie: "fast-food", sousCategorie: "Burger", marque: "McDonald's", kcal: 520, kcalParUnite: 520, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Big Mac", "Royal Cheese"] },
  { nom: "Royal Cheese", categorie: "fast-food", sousCategorie: "Burger", marque: "McDonald's", kcal: 460, kcalParUnite: 460, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Big Mac", "Royal Deluxe"] },
  { nom: "Double Cheese", categorie: "fast-food", sousCategorie: "Burger", marque: "McDonald's", kcal: 445, kcalParUnite: 445, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Big Mac", "Hamburger"] },
  { nom: "Filet-O-Fish", categorie: "fast-food", sousCategorie: "Burger", marque: "McDonald's", kcal: 330, kcalParUnite: 330, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["McChicken", "Big Mac"] },
  { nom: "McWrap Poulet", categorie: "fast-food", sousCategorie: "Wrap", marque: "McDonald's", kcal: 480, kcalParUnite: 480, qn: 2, portionDefaut: "1 wrap", unite: "piece", alternatives: ["McChicken", "Wrap KFC"] },
  { nom: "Hamburger McDo", categorie: "fast-food", sousCategorie: "Burger", marque: "McDonald's", kcal: 250, kcalParUnite: 250, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Double Cheese", "Cheeseburger"] },
  { nom: "Cheeseburger McDo", categorie: "fast-food", sousCategorie: "Burger", marque: "McDonald's", kcal: 300, kcalParUnite: 300, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Hamburger McDo", "Double Cheese"] },
  
  // Frites
  { nom: "Frites McDo petite", categorie: "fast-food", sousCategorie: "Frites", marque: "McDonald's", kcal: 230, kcalParUnite: 230, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo moyenne", "Frites BK petite"] },
  { nom: "Frites McDo moyenne", categorie: "fast-food", sousCategorie: "Frites", marque: "McDonald's", kcal: 340, kcalParUnite: 340, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo petite", "Frites McDo grande"] },
  { nom: "Frites McDo grande", categorie: "fast-food", sousCategorie: "Frites", marque: "McDonald's", kcal: 480, kcalParUnite: 480, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites McDo moyenne", "Frites BK grande"] },
  
  // Nuggets
  { nom: "Nuggets McDo 1 pièce", categorie: "fast-food", sousCategorie: "Nuggets", marque: "McDonald's", kcal: 45, kcalParUnite: 45, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Nuggets McDo menu 4 pièces", "Nuggets BK 1 pièce"] },
  { nom: "Nuggets McDo menu 4 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "McDonald's", kcal: 180, kcalParUnite: 180, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets McDo 1 pièce", "Nuggets McDo menu 6 pièces"] },
  { nom: "Nuggets McDo menu 6 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "McDonald's", kcal: 270, kcalParUnite: 270, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets McDo 1 pièce", "Nuggets McDo menu 9 pièces"] },
  { nom: "Nuggets McDo menu 9 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "McDonald's", kcal: 405, kcalParUnite: 405, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets McDo 1 pièce", "Nuggets McDo menu 20 pièces"] },
  { nom: "Nuggets McDo menu 20 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "McDonald's", kcal: 900, kcalParUnite: 900, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets McDo 1 pièce", "Nuggets BK menu 9 pièces"] },
  
  // Desserts
  { nom: "McFlurry Oreo", categorie: "fast-food", sousCategorie: "Dessert", marque: "McDonald's", kcal: 340, kcalParUnite: 340, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["McFlurry M&M's", "Sundae caramel"] },
  { nom: "McFlurry M&M's", categorie: "fast-food", sousCategorie: "Dessert", marque: "McDonald's", kcal: 360, kcalParUnite: 360, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["McFlurry Oreo", "Sundae chocolat"] },
  { nom: "Sundae caramel McDo", categorie: "fast-food", sousCategorie: "Dessert", marque: "McDonald's", kcal: 280, kcalParUnite: 280, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Sundae chocolat McDo", "McFlurry Oreo"] },
  { nom: "Sundae chocolat McDo", categorie: "fast-food", sousCategorie: "Dessert", marque: "McDonald's", kcal: 290, kcalParUnite: 290, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Sundae caramel McDo", "McFlurry M&M's"] },
  { nom: "Donuts McDo", categorie: "fast-food", sousCategorie: "Dessert", marque: "McDonald's", kcal: 260, kcalParUnite: 260, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Cookie McDo", "Muffin McDo"] },
  
  // Boissons
  { nom: "Coca-Cola McDo gobelet petit (25cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 105, kcalParUnite: 105, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Coca-Cola McDo gobelet moyen", "Sprite McDo gobelet petit"] },
  { nom: "Coca-Cola McDo gobelet moyen (40cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 168, kcalParUnite: 168, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Coca-Cola McDo gobelet petit", "Coca-Cola McDo gobelet grand"] },
  { nom: "Coca-Cola McDo gobelet grand (50cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 210, kcalParUnite: 210, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Coca-Cola McDo gobelet moyen", "Sprite McDo gobelet grand"] },
  
  { nom: "Sprite McDo gobelet petit (25cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 100, kcalParUnite: 100, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Sprite McDo gobelet moyen", "Coca-Cola McDo gobelet petit"] },
  { nom: "Sprite McDo gobelet moyen (40cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 160, kcalParUnite: 160, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Sprite McDo gobelet petit", "Sprite McDo gobelet grand"] },
  { nom: "Sprite McDo gobelet grand (50cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 200, kcalParUnite: 200, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Sprite McDo gobelet moyen", "Fanta McDo gobelet grand"] },
  
  { nom: "Fanta McDo gobelet petit (25cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 103, kcalParUnite: 103, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Fanta McDo gobelet moyen", "Coca-Cola McDo gobelet petit"] },
  { nom: "Fanta McDo gobelet moyen (40cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 164, kcalParUnite: 164, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Fanta McDo gobelet petit", "Fanta McDo gobelet grand"] },
  { nom: "Fanta McDo gobelet grand (50cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 205, kcalParUnite: 205, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Fanta McDo gobelet moyen", "Sprite McDo gobelet grand"] },
  
  { nom: "Milkshake vanille McDo petit (30cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 315, kcalParUnite: 315, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Milkshake vanille McDo moyen", "Milkshake chocolat McDo petit"] },
  { nom: "Milkshake vanille McDo moyen (40cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 420, kcalParUnite: 420, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Milkshake vanille McDo petit", "Milkshake vanille McDo grand"] },
  { nom: "Milkshake vanille McDo grand (50cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 525, kcalParUnite: 525, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Milkshake vanille McDo moyen", "Milkshake chocolat McDo grand"] },
  
  { nom: "Milkshake chocolat McDo petit (30cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 323, kcalParUnite: 323, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Milkshake chocolat McDo moyen", "Milkshake vanille McDo petit"] },
  { nom: "Milkshake chocolat McDo moyen (40cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 430, kcalParUnite: 430, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Milkshake chocolat McDo petit", "Milkshake chocolat McDo grand"] },
  { nom: "Milkshake chocolat McDo grand (50cl)", categorie: "fast-food", sousCategorie: "Boisson", marque: "McDonald's", kcal: 538, kcalParUnite: 538, qn: 1, portionDefaut: "1 gobelet", unite: "gobelet", alternatives: ["Milkshake chocolat McDo moyen", "Milkshake vanille McDo grand"] },

  // === KFC === (Enrichissement 2026-01-07)
  // Poulet
  { nom: "Poulet Original KFC 1 pièce", categorie: "fast-food", sousCategorie: "Poulet", marque: "KFC", kcal: 290, kcalParUnite: 290, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Hot Wings KFC", "Tenders KFC"] },
  { nom: "Hot Wings KFC 1 pièce", categorie: "fast-food", sousCategorie: "Poulet", marque: "KFC", kcal: 80, kcalParUnite: 80, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Hot Wings KFC menu 3 pièces", "Tenders KFC 1 pièce"] },
  { nom: "Hot Wings KFC menu 3 pièces", categorie: "fast-food", sousCategorie: "Poulet", marque: "KFC", kcal: 240, kcalParUnite: 240, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Hot Wings KFC 1 pièce", "Hot Wings KFC menu 6 pièces"] },
  { nom: "Hot Wings KFC menu 6 pièces", categorie: "fast-food", sousCategorie: "Poulet", marque: "KFC", kcal: 480, kcalParUnite: 480, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Hot Wings KFC 1 pièce", "Hot Wings KFC menu 3 pièces"] },
  { nom: "Tenders KFC 1 pièce", categorie: "fast-food", sousCategorie: "Poulet", marque: "KFC", kcal: 130, kcalParUnite: 130, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Tenders KFC menu 3 pièces", "Hot Wings KFC 1 pièce"] },
  { nom: "Tenders KFC menu 3 pièces", categorie: "fast-food", sousCategorie: "Poulet", marque: "KFC", kcal: 390, kcalParUnite: 390, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Tenders KFC 1 pièce", "Tenders KFC menu 6 pièces"] },
  { nom: "Tenders KFC menu 6 pièces", categorie: "fast-food", sousCategorie: "Poulet", marque: "KFC", kcal: 780, kcalParUnite: 780, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Tenders KFC 1 pièce", "Tenders KFC menu 3 pièces"] },
  { nom: "Bucket KFC menu 10 pièces", categorie: "fast-food", sousCategorie: "Poulet", marque: "KFC", kcal: 2900, kcalParUnite: 2900, qn: 1, portionDefaut: "1 bucket", unite: "piece", alternatives: ["Poulet Original KFC", "Hot Wings KFC menu 6 pièces"] },
  
  // Burgers
  { nom: "Colonel Original KFC", categorie: "fast-food", sousCategorie: "Burger", marque: "KFC", kcal: 520, kcalParUnite: 520, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Zinger KFC", "Kentucky Burger"] },
  { nom: "Zinger KFC", categorie: "fast-food", sousCategorie: "Burger", marque: "KFC", kcal: 550, kcalParUnite: 550, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Colonel Original KFC", "McChicken"] },
  { nom: "Kentucky Burger", categorie: "fast-food", sousCategorie: "Burger", marque: "KFC", kcal: 480, kcalParUnite: 480, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Colonel Original KFC", "Zinger KFC"] },
  
  // Accompagnements
  { nom: "Frites KFC petite", categorie: "fast-food", sousCategorie: "Frites", marque: "KFC", kcal: 220, kcalParUnite: 220, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites KFC moyenne", "Frites McDo petite"] },
  { nom: "Frites KFC moyenne", categorie: "fast-food", sousCategorie: "Frites", marque: "KFC", kcal: 340, kcalParUnite: 340, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites KFC petite", "Frites KFC grande"] },
  { nom: "Frites KFC grande", categorie: "fast-food", sousCategorie: "Frites", marque: "KFC", kcal: 390, kcalParUnite: 390, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites KFC moyenne", "Frites McDo grande"] },
  { nom: "Coleslaw KFC", categorie: "fast-food", sousCategorie: "Accompagnement", marque: "KFC", kcal: 120, kcalParUnite: 120, qn: 2, portionDefaut: "1 portion", unite: "piece", alternatives: ["Purée KFC", "Maïs KFC"] },
  { nom: "Purée KFC", categorie: "fast-food", sousCategorie: "Accompagnement", marque: "KFC", kcal: 110, kcalParUnite: 110, qn: 2, portionDefaut: "1 portion", unite: "piece", alternatives: ["Coleslaw KFC", "Maïs KFC"] },
  { nom: "Maïs KFC", categorie: "fast-food", sousCategorie: "Accompagnement", marque: "KFC", kcal: 70, kcalParUnite: 70, qn: 2, portionDefaut: "1 portion", unite: "piece", alternatives: ["Coleslaw KFC", "Purée KFC"] },
  
  // Desserts
  { nom: "Sundae KFC", categorie: "fast-food", sousCategorie: "Dessert", marque: "KFC", kcal: 240, kcalParUnite: 240, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Cookie KFC", "Brownie KFC"] },
  { nom: "Cookie KFC", categorie: "fast-food", sousCategorie: "Dessert", marque: "KFC", kcal: 200, kcalParUnite: 200, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Brownie KFC", "Cookie Subway"] },
  { nom: "Brownie KFC", categorie: "fast-food", sousCategorie: "Dessert", marque: "KFC", kcal: 280, kcalParUnite: 280, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Cookie KFC", "Sundae KFC"] },
  { nom: "Glace vanille KFC", categorie: "fast-food", sousCategorie: "Dessert", marque: "KFC", kcal: 180, kcalParUnite: 180, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Glace chocolat KFC", "Sundae KFC"] },
  { nom: "Glace chocolat KFC", categorie: "fast-food", sousCategorie: "Dessert", marque: "KFC", kcal: 190, kcalParUnite: 190, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Glace vanille KFC", "Sundae KFC"] },

  // === SUBWAY === (Enrichissement 2026-01-07)
  // Subs 15cm
  { nom: "Sub Italian BMT 15cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 230, kcalParUnite: 230, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Italian BMT 30cm", "Sub Jambon 15cm"] },
  { nom: "Sub Thon 15cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 210, kcalParUnite: 210, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Thon 30cm", "Sub Poulet Teriyaki 15cm"] },
  { nom: "Sub Jambon 15cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 190, kcalParUnite: 190, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Jambon 30cm", "Sub Italian BMT 15cm"] },
  { nom: "Sub Poulet Teriyaki 15cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 240, kcalParUnite: 240, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Poulet Teriyaki 30cm", "Sub Thon 15cm"] },
  { nom: "Sub Veggie Delite 15cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 160, kcalParUnite: 160, qn: 3, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Veggie Delite 30cm", "Salade Veggie Subway"] },
  { nom: "Sub Steak & Cheese 15cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 280, kcalParUnite: 280, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Steak & Cheese 30cm", "Sub Italian BMT 15cm"] },
  
  // Subs 30cm
  { nom: "Sub Italian BMT 30cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 460, kcalParUnite: 460, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Italian BMT 15cm", "Sub Jambon 30cm"] },
  { nom: "Sub Thon 30cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 420, kcalParUnite: 420, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Thon 15cm", "Sub Poulet Teriyaki 30cm"] },
  { nom: "Sub Jambon 30cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 380, kcalParUnite: 380, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Jambon 15cm", "Sub Italian BMT 30cm"] },
  { nom: "Sub Poulet Teriyaki 30cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 480, kcalParUnite: 480, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Poulet Teriyaki 15cm", "Sub Thon 30cm"] },
  { nom: "Sub Veggie Delite 30cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 320, kcalParUnite: 320, qn: 3, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Veggie Delite 15cm", "Salade Veggie Subway"] },
  { nom: "Sub Steak & Cheese 30cm", categorie: "fast-food", sousCategorie: "Sandwich", marque: "Subway", kcal: 560, kcalParUnite: 560, qn: 2, portionDefaut: "1 sandwich", unite: "piece", alternatives: ["Sub Steak & Cheese 15cm", "Sub Italian BMT 30cm"] },
  
  // Wraps
  { nom: "Wrap Poulet Subway", categorie: "fast-food", sousCategorie: "Wrap", marque: "Subway", kcal: 380, kcalParUnite: 380, qn: 2, portionDefaut: "1 wrap", unite: "piece", alternatives: ["Wrap Thon Subway", "McWrap Poulet"] },
  { nom: "Wrap Thon Subway", categorie: "fast-food", sousCategorie: "Wrap", marque: "Subway", kcal: 350, kcalParUnite: 350, qn: 2, portionDefaut: "1 wrap", unite: "piece", alternatives: ["Wrap Poulet Subway", "Wrap Veggie Subway"] },
  { nom: "Wrap Veggie Subway", categorie: "fast-food", sousCategorie: "Wrap", marque: "Subway", kcal: 290, kcalParUnite: 290, qn: 3, portionDefaut: "1 wrap", unite: "piece", alternatives: ["Wrap Poulet Subway", "Sub Veggie Delite 30cm"] },
  
  // Salades
  { nom: "Salade Poulet Subway", categorie: "fast-food", sousCategorie: "Salade", marque: "Subway", kcal: 220, kcalParUnite: 220, qn: 3, portionDefaut: "1 salade", unite: "piece", alternatives: ["Salade Thon Subway", "Wrap Poulet Subway"] },
  { nom: "Salade Thon Subway", categorie: "fast-food", sousCategorie: "Salade", marque: "Subway", kcal: 200, kcalParUnite: 200, qn: 3, portionDefaut: "1 salade", unite: "piece", alternatives: ["Salade Poulet Subway", "Salade Veggie Subway"] },
  { nom: "Salade Veggie Subway", categorie: "fast-food", sousCategorie: "Salade", marque: "Subway", kcal: 140, kcalParUnite: 140, qn: 4, portionDefaut: "1 salade", unite: "piece", alternatives: ["Salade Poulet Subway", "Sub Veggie Delite 30cm"] },
  
  // Accompagnements
  { nom: "Chips Lay's Subway", categorie: "fast-food", sousCategorie: "Accompagnement", marque: "Subway", kcal: 150, kcalParUnite: 150, qn: 1, portionDefaut: "1 sachet", unite: "piece", alternatives: ["Frites McDo petite", "Chips"] },

  // === BURGER KING === (Enrichissement 2026-01-07)
  // Burgers
  { nom: "Whopper", categorie: "fast-food", sousCategorie: "Burger", marque: "Burger King", kcal: 660, kcalParUnite: 660, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Big Mac", "Double Whopper"] },
  { nom: "Whopper Jr", categorie: "fast-food", sousCategorie: "Burger", marque: "Burger King", kcal: 340, kcalParUnite: 340, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Whopper", "Hamburger McDo"] },
  { nom: "Double Whopper", categorie: "fast-food", sousCategorie: "Burger", marque: "Burger King", kcal: 900, kcalParUnite: 900, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Whopper", "Big Mac"] },
  { nom: "Chicken Royale BK", categorie: "fast-food", sousCategorie: "Burger", marque: "Burger King", kcal: 550, kcalParUnite: 550, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["McChicken", "Crispy Chicken BK"] },
  { nom: "Steakhouse BK", categorie: "fast-food", sousCategorie: "Burger", marque: "Burger King", kcal: 680, kcalParUnite: 680, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Whopper", "Royal Deluxe"] },
  { nom: "Crispy Chicken BK", categorie: "fast-food", sousCategorie: "Burger", marque: "Burger King", kcal: 520, kcalParUnite: 520, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Chicken Royale BK", "McChicken"] },
  { nom: "Fish King", categorie: "fast-food", sousCategorie: "Burger", marque: "Burger King", kcal: 410, kcalParUnite: 410, qn: 1, portionDefaut: "1 burger", unite: "piece", alternatives: ["Filet-O-Fish", "Chicken Royale BK"] },
  
  // Accompagnements
  { nom: "Frites BK petite", categorie: "fast-food", sousCategorie: "Frites", marque: "Burger King", kcal: 240, kcalParUnite: 240, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites BK moyenne", "Frites McDo petite"] },
  { nom: "Frites BK moyenne", categorie: "fast-food", sousCategorie: "Frites", marque: "Burger King", kcal: 360, kcalParUnite: 360, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites BK petite", "Frites BK grande"] },
  { nom: "Frites BK grande", categorie: "fast-food", sousCategorie: "Frites", marque: "Burger King", kcal: 500, kcalParUnite: 500, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Frites BK moyenne", "Frites McDo grande"] },
  { nom: "Onion Rings BK petite", categorie: "fast-food", sousCategorie: "Accompagnement", marque: "Burger King", kcal: 180, kcalParUnite: 180, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Onion Rings BK grande", "Frites BK petite"] },
  { nom: "Onion Rings BK grande", categorie: "fast-food", sousCategorie: "Accompagnement", marque: "Burger King", kcal: 360, kcalParUnite: 360, qn: 1, portionDefaut: "1 portion", unite: "piece", alternatives: ["Onion Rings BK petite", "Frites BK grande"] },
  { nom: "Nuggets BK 1 pièce", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Burger King", kcal: 43, kcalParUnite: 43, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Nuggets BK menu 6 pièces", "Nuggets McDo 1 pièce"] },
  { nom: "Nuggets BK menu 6 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Burger King", kcal: 260, kcalParUnite: 260, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets BK 1 pièce", "Nuggets BK menu 9 pièces"] },
  { nom: "Nuggets BK menu 9 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Burger King", kcal: 390, kcalParUnite: 390, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets BK 1 pièce", "King Nuggets menu 20 pièces"] },
  { nom: "King Nuggets menu 20 pièces", categorie: "fast-food", sousCategorie: "Nuggets", marque: "Burger King", kcal: 860, kcalParUnite: 860, qn: 1, portionDefaut: "1 menu", unite: "piece", alternatives: ["Nuggets BK 1 pièce", "Nuggets McDo menu 20 pièces"] },
  
  // Desserts
  { nom: "Sundae BK caramel", categorie: "fast-food", sousCategorie: "Dessert", marque: "Burger King", kcal: 270, kcalParUnite: 270, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Sundae BK chocolat", "Sundae caramel McDo"] },
  { nom: "Sundae BK chocolat", categorie: "fast-food", sousCategorie: "Dessert", marque: "Burger King", kcal: 280, kcalParUnite: 280, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Sundae BK caramel", "Sundae chocolat McDo"] },
  { nom: "Cookie BK", categorie: "fast-food", sousCategorie: "Dessert", marque: "Burger King", kcal: 190, kcalParUnite: 190, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Brownie BK", "Cookie Subway"] },
  { nom: "Brownie BK", categorie: "fast-food", sousCategorie: "Dessert", marque: "Burger King", kcal: 270, kcalParUnite: 270, qn: 1, portionDefaut: "1 pièce", unite: "piece", alternatives: ["Cookie BK", "Brownie KFC"] },
  { nom: "Glace vanille BK", categorie: "fast-food", sousCategorie: "Dessert", marque: "Burger King", kcal: 170, kcalParUnite: 170, qn: 1, portionDefaut: "1 pot", unite: "piece", alternatives: ["Sundae BK caramel", "Glace vanille KFC"] },
];
correctifsAliments.forEach(nouveau => {
  const doublon = referentielAliments.some(existant =>
    existant.nom === nouveau.nom &&
    existant.categorie === nouveau.categorie &&
    (existant.marque === nouveau.marque || (!existant.marque && !nouveau.marque))
  );
  if (!doublon) referentielAliments.push(nouveau);
});

// ============================================================================
// 🎯 CRISTALLISATION: CRITÈRES DYNAMIQUES (PHASE 45J POST-REPRISE)
// ============================================================================
// Critères générés depuis bilan_reprise (PAS hardcodés)
// Validation quotidienne pour tracking nouveaux comportements
// ============================================================================

export const criteresCristallisation = {
  CRITERE_EXTRAS_FREQUENTS: {
    id: 'extras_reduction',
    nom: 'Réduction extras fréquents',
    conditions_activation: {
      seuil_reprise: 10,
      formule: 'bilan_reprise.extras.total > 10',
      description: 'Activé si >10 extras durant reprise'
    },
    configuration: {
      calcul_seuil: (bilanReprise) => {
        const extrasReprise = bilanReprise?.extras?.total || 0;
        return Math.ceil(extrasReprise * 0.32); // 68% de réduction
      },
      validation_quotidienne: (repasJour) => {
        return repasJour.filter(r => r.est_extra).length === 0;
      },
      validation_hebdomadaire: (repasSemaine, seuil) => {
        const nbExtras = repasSemaine.filter(r => r.est_extra).length;
        return nbExtras <= seuil;
      }
    },
    messages: {
      encouragement: 'Bravo ! Aucun extra aujourd\'hui 💪',
      encouragement_streak: 'Tu tiens bon depuis {{nb_jours}} jours ! Continue 🔥',
      alerte: '⚠️ Extra détecté. Tu as {{nb_extras}}/{{seuil}} cette semaine',
      alerte_critique: '🚨 Limite dépassée ! {{nb_extras}} extras cette semaine',
      victoire_21j: '🏆 21 jours sans extras ! Habitude vaincue !',
      victoire_finale: '🎯 45 jours terminés ! Les extras ne sont plus une habitude'
    },
    tracking: {
      comportement_cible: 'pas_extra_journalier',
      victoire_21j: true,
      comparaison_reprise: 'extras.total'
    }
  },

  CRITERE_FECULENTS_SOIR: {
    id: 'feculents_timing',
    nom: 'Aucun féculent le soir',
    conditions_activation: {
      seuil_reprise: 5,
      formule: 'bilan_reprise.feculents_soir.occurrences > 5',
      description: 'Activé si >5 féculents le soir durant reprise'
    },
    configuration: {
      calcul_seuil: () => 0, // Objectif 0 féculent le soir
      validation_quotidienne: (repasJour) => {
        const repasSoir = repasJour.filter(r => {
          const heure = new Date(r.heure_repas).getHours();
          return heure >= 19;
        });
        return !repasSoir.some(r => 
          r.composition?.some(c => ['feculent', 'pain'].includes(c.categorie))
        );
      }
    },
    messages: {
      encouragement: 'Parfait ! Pas de féculents le soir 🌙',
      alerte: '⚠️ Féculent détecté après 19h',
      victoire_21j: '🏆 21 jours de timing parfait !',
      victoire_finale: '🎯 Nouveau réflexe ancré : pas de féculents le soir'
    },
    tracking: {
      comportement_cible: 'feculents_timing_ok',
      victoire_21j: true,
      comparaison_reprise: 'feculents_soir.occurrences'
    }
  },

  CRITERE_QN_FAIBLE: {
    id: 'amelioration_qn',
    nom: 'QN moyen ≥ 3.5',
    conditions_activation: {
      seuil_reprise: 3.2,
      formule: 'bilan_reprise.qn_moyen < 3.2',
      description: 'Activé si QN moyen <3.2 durant reprise'
    },
    configuration: {
      calcul_seuil: () => 3.5,
      validation_quotidienne: (repasJour) => {
        const qnTotal = repasJour.reduce((sum, r) => sum + (r.qn || 0), 0);
        const qnMoyen = repasJour.length > 0 ? qnTotal / repasJour.length : 0;
        return qnMoyen >= 3.5;
      }
    },
    messages: {
      encouragement: 'QN excellent aujourd\'hui ! ({{qn_moyen}}/5) ⭐',
      alerte: 'QN faible aujourd\'hui ({{qn_moyen}}/5). Vise 3.5+ 📊',
      victoire_21j: '🏆 21 jours avec QN ≥3.5 !',
      victoire_finale: '🎯 Qualité nutritionnelle devenue naturelle'
    },
    tracking: {
      comportement_cible: 'qn_optimal',
      victoire_21j: true,
      comparaison_reprise: 'qn_moyen'
    }
  },

  CRITERE_QUANTITES_EXCESSIVES: {
    id: 'respect_portions',
    nom: 'Conformité portions ≥ 90%',
    conditions_activation: {
      seuil_reprise: 75,
      formule: 'bilan_reprise.quantites_excessives.taux_conformite < 75',
      description: 'Activé si <75% conformité portions durant reprise'
    },
    configuration: {
      calcul_seuil: () => 90,
      validation_quotidienne: (repasJour) => {
        const conformes = repasJour.filter(r => r.quantite_conforme).length;
        return repasJour.length > 0 ? (conformes / repasJour.length * 100) >= 90 : true;
      }
    },
    messages: {
      encouragement: 'Portions respectées ! {{taux}}% de conformité 📏',
      alerte: 'Attention aux quantités. Seulement {{taux}}% conforme',
      victoire_21j: '🏆 21 jours de portions maîtrisées !',
      victoire_finale: '🎯 Les bonnes quantités sont devenues automatiques'
    },
    tracking: {
      comportement_cible: 'portions_respectees',
      victoire_21j: true,
      comparaison_reprise: 'quantites_excessives.taux_conformite'
    }
  },

  CRITERE_JEUNES_IRREGULIERS: {
    id: 'jeunes_reguliers',
    nom: '2 jeûnes ponctuels/semaine',
    conditions_activation: {
      seuil_reprise: 70,
      formule: 'bilan_reprise.jeunes_ponctuels.taux < 70',
      description: 'Activé si <70% succès jeûnes durant reprise'
    },
    configuration: {
      calcul_seuil: () => 2,
      validation_hebdomadaire: (jeunesSemaine) => {
        return jeunesSemaine.filter(j => j.reussi).length >= 2;
      }
    },
    messages: {
      encouragement: '{{nb_jeunes}}/2 jeûnes cette semaine ! Continue 🌟',
      alerte: 'Seulement {{nb_jeunes}}/2 jeûnes. Planifie le prochain 📅',
      victoire_21j: '🏆 Jeûnes réguliers depuis 21 jours !',
      victoire_finale: '🎯 Les jeûnes ponctuels font partie de ta routine'
    },
    tracking: {
      comportement_cible: 'jeunes_reguliers',
      victoire_21j: true,
      comparaison_reprise: 'jeunes_ponctuels.taux'
    }
  },

  CRITERE_PRATIQUES_SPIRITUELLES: {
    id: 'pratiques_regulieres',
    nom: '≥3 pratiques spirituelles/jour',
    conditions_activation: {
      seuil_reprise: 3,
      formule: 'bilan_reprise.pratiques_spirituelles.moyenne_par_jour < 3 || bilan_reprise.pratiques_spirituelles.irregularite === true',
      description: 'Activé si <3/jour OU irrégulier durant reprise'
    },
    configuration: {
      calcul_seuil: () => 3,
      validation_quotidienne: (pratiquesJour) => {
        return pratiquesJour.length >= 3;
      }
    },
    messages: {
      encouragement: '{{nb_pratiques}} pratiques aujourd\'hui ! Équilibre spirituel 🙏',
      alerte: 'Seulement {{nb_pratiques}}/3 pratiques. Prends un moment 📿',
      victoire_21j: '🏆 21 jours de régularité spirituelle !',
      victoire_finale: '🎯 Ta vie spirituelle est devenue une priorité quotidienne'
    },
    tracking: {
      comportement_cible: 'pratiques_regulieres',
      victoire_21j: true,
      comparaison_reprise: 'pratiques_spirituelles.moyenne_par_jour'
    }
  }
};

/**
 * Génère critères personnalisés depuis bilan_reprise
 * @param {Object} bilanReprise - Données transmises depuis reprise-alimentaire-apres-jeune.js
 * @returns {Array} Critères activés et configurés
 */
export function genererCriteresPersonnalises(bilanReprise) {
  const criteresActives = [];
  
  Object.values(criteresCristallisation).forEach(critere => {
    if (evaluerConditionSecurisee(critere.conditions_activation.formule, bilanReprise)) {
      const seuilCible = critere.configuration.calcul_seuil(bilanReprise);
      
      criteresActives.push({
        id: critere.id,
        nom: critere.nom,
        seuil_cible: seuilCible,
        validation_quotidienne: critere.configuration.validation_quotidienne,
        validation_hebdomadaire: critere.configuration.validation_hebdomadaire,
        messages: critere.messages,
        tracking: critere.tracking
      });
    }
  });
  
  return criteresActives;
}

/**
 * Évalue condition d'activation de manière SÉCURISÉE (pas eval())
 */
function evaluerConditionSecurisee(formule, bilanReprise) {
  try {
    const regex = /bilan_reprise\.([a-zA-Z0-9_.]+)\s*(>|<|>=|<=|===|!==|==|!=)\s*([0-9]+(?:\.[0-9]+)?|true|false)/;
    const match = formule.match(regex);
    
    if (!match) return false;
    
    const [, chemin, operateur, valeurStr] = match;
    const valeurBilan = chemin.split('.').reduce((obj, key) => obj?.[key], bilanReprise);
    
    if (valeurBilan === undefined) return false;
    
    const valeurComparaison = valeurStr === 'true' ? true : 
                              valeurStr === 'false' ? false : 
                              parseFloat(valeurStr);
    
    switch (operateur) {
      case '>': return valeurBilan > valeurComparaison;
      case '<': return valeurBilan < valeurComparaison;
      case '>=': return valeurBilan >= valeurComparaison;
      case '<=': return valeurBilan <= valeurComparaison;
      case '===': return valeurBilan === valeurComparaison;
      case '!==': return valeurBilan !== valeurComparaison;
      default: return false;
    }
  } catch (error) {
    console.error('Erreur évaluation condition:', error);
    return false;
  }
}

// ============================================================================
// CRITÈRES QUOTIDIENS CRISTALLISATION (45 JOURS × 5 CRITÈRES/JOUR = 225)
// ============================================================================

export const CRITERES_CRISTALLISATION = {
  criteres_quotidiens: [
    // JOURS 1-5 : FONDAMENTAUX
    { id: 'crit_1_1', nom: 'Aucun extra aujourd\'hui', description: 'Pas de snack, bonbon, soda ou écart', type: 'extras', difficulte: 1, points: 10 },
    { id: 'crit_1_2', nom: 'Hydratation 2L', description: 'Boire au moins 2 litres d\'eau', type: 'hydratation', difficulte: 1, points: 10 },
    { id: 'crit_1_3', nom: 'Petit-déjeuner avant 9h', description: 'Prendre le petit-déjeuner avant 9h du matin', type: 'timing', difficulte: 1, points: 10 },
    { id: 'crit_1_4', nom: 'Dîner avant 20h', description: 'Prendre le dîner avant 20h', type: 'timing', difficulte: 2, points: 15 },
    { id: 'crit_1_5', nom: 'Légumes à chaque repas', description: 'Inclure des légumes au déjeuner et au dîner', type: 'composition', difficulte: 1, points: 10 },
    
    { id: 'crit_2_1', nom: 'Aucun sucre raffiné', description: 'Éviter sucre blanc, bonbons, gâteaux industriels', type: 'extras', difficulte: 2, points: 15 },
    { id: 'crit_2_2', nom: '3 repas réguliers', description: 'Respecter 3 repas sans grignotage', type: 'comportement', difficulte: 1, points: 10 },
    { id: 'crit_2_3', nom: 'Mastication lente', description: 'Prendre au moins 20 min par repas', type: 'comportement', difficulte: 2, points: 15 },
    { id: 'crit_2_4', nom: 'Protéine au petit-déjeuner', description: 'Inclure œuf, fromage blanc ou protéine végétale', type: 'composition', difficulte: 1, points: 10 },
    { id: 'crit_2_5', nom: 'Pas d\'écrans pendant repas', description: 'Manger sans téléphone, TV ou ordinateur', type: 'comportement', difficulte: 2, points: 15 },
    
    { id: 'crit_3_1', nom: 'Fruits frais uniquement', description: 'Pas de jus, compotes sucrées ou fruits séchés', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_3_2', nom: 'Céréales complètes', description: 'Pain complet, riz brun, pâtes complètes', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_3_3', nom: 'Huile crue uniquement', description: 'Utiliser huile d\'olive, colza, noix à froid', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_3_4', nom: 'Portion protéines adaptée', description: 'Paume de main pour viande/poisson', type: 'quantite', difficulte: 1, points: 10 },
    { id: 'crit_3_5', nom: 'Collation si faim réelle', description: 'Fruit ou oléagineux si besoin physiologique', type: 'comportement', difficulte: 2, points: 15 },
    
    { id: 'crit_4_1', nom: 'Jeûne nocturne 12h', description: 'Respecter 12h entre dîner et petit-déjeuner', type: 'timing', difficulte: 2, points: 15 },
    { id: 'crit_4_2', nom: 'Légumineuses présentes', description: 'Lentilles, pois chiches ou haricots au menu', type: 'composition', difficulte: 1, points: 10 },
    { id: 'crit_4_3', nom: 'Cuisson douce', description: 'Vapeur, mijoté ou four doux (pas de friture)', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_4_4', nom: 'Assiette colorée', description: 'Au moins 3 couleurs différentes au repas', type: 'composition', difficulte: 1, points: 10 },
    { id: 'crit_4_5', nom: 'Manger assis', description: 'Tous les repas pris assis à table', type: 'comportement', difficulte: 1, points: 10 },
    
    { id: 'crit_5_1', nom: 'Zéro alcool', description: 'Aucune boisson alcoolisée', type: 'extras', difficulte: 2, points: 15 },
    { id: 'crit_5_2', nom: 'Aromates frais', description: 'Herbes, ail, oignon, gingembre utilisés', type: 'qualite', difficulte: 1, points: 10 },
    { id: 'crit_5_3', nom: 'Satiété respectée', description: 'Arrêter de manger à 80% de satiété', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_5_4', nom: 'Légumes crus inclus', description: 'Crudités ou salade au déjeuner', type: 'composition', difficulte: 1, points: 10 },
    { id: 'crit_5_5', nom: 'Pas de plat préparé', description: 'Cuisine maison uniquement', type: 'qualite', difficulte: 2, points: 15 },
    
    // JOURS 6-10 : RENFORCEMENT
    { id: 'crit_6_1', nom: 'Oléagineux portion', description: '1 petite poignée amandes, noix ou noisettes', type: 'quantite', difficulte: 1, points: 10 },
    { id: 'crit_6_2', nom: 'Thé vert ou tisane', description: 'Au moins 1 tasse dans la journée', type: 'hydratation', difficulte: 1, points: 10 },
    { id: 'crit_6_3', nom: 'Pause après chaque bouchée', description: 'Poser couverts entre chaque bouchée', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_6_4', nom: 'Féculents portion contrôlée', description: 'Poing fermé maximum', type: 'quantite', difficulte: 2, points: 15 },
    { id: 'crit_6_5', nom: 'Épices variées', description: 'Curcuma, paprika, curry ou cannelle', type: 'qualite', difficulte: 1, points: 10 },
    
    { id: 'crit_7_1', nom: 'Repas principal léger', description: 'Dîner plus léger que déjeuner', type: 'quantite', difficulte: 2, points: 15 },
    { id: 'crit_7_2', nom: 'Bio si possible', description: 'Privilégier produits biologiques', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_7_3', nom: 'Gratitude avant repas', description: 'Moment de remerciement ou respiration', type: 'comportement', difficulte: 1, points: 10 },
    { id: 'crit_7_4', nom: 'Poisson gras', description: 'Saumon, maquereau ou sardines', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_7_5', nom: 'Pas de sauce industrielle', description: 'Éviter ketchup, mayo industrielle', type: 'extras', difficulte: 1, points: 10 },
    
    { id: 'crit_8_1', nom: 'Graines ajoutées', description: 'Chia, lin, sésame ou courge', type: 'composition', difficulte: 1, points: 10 },
    { id: 'crit_8_2', nom: 'Bouillon maison', description: 'Préparation soupe ou bouillon légumes', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_8_3', nom: 'Jeûne intermittent 14h', description: 'Étendre jeûne nocturne à 14h', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_8_4', nom: 'Produits fermentés', description: 'Yaourt nature, choucroute ou kéfir', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_8_5', nom: 'Éviter aliments transformés', description: 'Aucun additif, conservateur ou colorant', type: 'qualite', difficulte: 2, points: 15 },
    
    { id: 'crit_9_1', nom: 'Mâcher 30 fois', description: 'Compter mastications pour 1 bouchée', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_9_2', nom: 'Diversité protéines', description: 'Alterner animales et végétales', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_9_3', nom: 'Sel modéré', description: 'Limiter sel ajouté, privilégier épices', type: 'quantite', difficulte: 2, points: 15 },
    { id: 'crit_9_4', nom: 'Légumes à volonté', description: 'Remplir moitié assiette de légumes', type: 'quantite', difficulte: 1, points: 10 },
    { id: 'crit_9_5', nom: 'Eau avant repas', description: 'Grand verre 15 min avant manger', type: 'hydratation', difficulte: 1, points: 10 },
    
    { id: 'crit_10_1', nom: 'Aucun édulcorant', description: 'Ni aspartame ni stévia', type: 'extras', difficulte: 2, points: 15 },
    { id: 'crit_10_2', nom: 'Prébiotiques présents', description: 'Ail, oignon, poireau ou asperges', type: 'composition', difficulte: 1, points: 10 },
    { id: 'crit_10_3', nom: 'Respiration consciente', description: '5 respirations avant de commencer', type: 'comportement', difficulte: 1, points: 10 },
    { id: 'crit_10_4', nom: 'Cuisson al dente', description: 'Pâtes et légumes croquants', type: 'qualite', difficulte: 1, points: 10 },
    { id: 'crit_10_5', nom: 'Local et saison', description: 'Produits de saison et locaux', type: 'qualite', difficulte: 2, points: 15 },
    
    // JOURS 11-15 : APPROFONDISSEMENT
    { id: 'crit_11_1', nom: 'Citron le matin', description: 'Eau tiède + citron à jeun', type: 'hydratation', difficulte: 1, points: 10 },
    { id: 'crit_11_2', nom: 'Chrononutrition respectée', description: 'Gras matin, protéines midi, léger soir', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_11_3', nom: 'Portion glucides réduite', description: 'Diviser par deux portion habituelle', type: 'quantite', difficulte: 3, points: 20 },
    { id: 'crit_11_4', nom: 'Algues intégrées', description: 'Nori, wakame ou spiruline', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_11_5', nom: 'Manger en silence', description: 'Au moins un repas sans conversation', type: 'comportement', difficulte: 3, points: 20 },
    
    { id: 'crit_12_1', nom: 'Germinations ajoutées', description: 'Graines germées dans salade', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_12_2', nom: 'Jeûne 16h atteint', description: 'Sauter petit-déjeuner ou dîner', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_12_3', nom: 'Cru 50% volume', description: 'Moitié aliments crus au repas', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_12_4', nom: 'Mastication zen', description: 'Concentration totale sur textures', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_12_5', nom: 'Zéro produit laitier', description: 'Aucun lait, fromage ou yaourt animal', type: 'extras', difficulte: 3, points: 20 },
    
    { id: 'crit_13_1', nom: 'Smoothie vert', description: 'Épinards, banane, lait végétal', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_13_2', nom: 'Huiles variées', description: 'Alterner olive, colza, lin, chanvre', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_13_3', nom: 'Portion main complète', description: 'Visuel portion = paume + doigts', type: 'quantite', difficulte: 2, points: 15 },
    { id: 'crit_13_4', nom: 'Marche post-repas', description: '10 min marche après déjeuner', type: 'comportement', difficulte: 2, points: 15 },
    { id: 'crit_13_5', nom: 'Super-aliments', description: 'Baies goji, açai ou cacao cru', type: 'composition', difficulte: 2, points: 15 },
    
    { id: 'crit_14_1', nom: 'Monodiète partielle', description: 'Un repas un seul type aliment', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_14_2', nom: 'Index glycémique bas', description: 'Tous glucides IG < 55', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_14_3', nom: 'Pollen ou propolis', description: 'Ajout produits ruche', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_14_4', nom: 'Assiette minimaliste', description: 'Maximum 5 ingrédients par repas', type: 'comportement', difficulte: 2, points: 15 },
    { id: 'crit_14_5', nom: 'Boissons zéro calorie', description: 'Uniquement eau, thé, tisane', type: 'extras', difficulte: 2, points: 15 },
    
    { id: 'crit_15_1', nom: 'Détox foie activée', description: 'Radis noir, artichaut ou pissenlit', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_15_2', nom: 'Jeûne complet soir', description: 'Sauter dîner complètement', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_15_3', nom: 'Température aliments', description: 'Ni trop chaud ni trop froid', type: 'qualite', difficulte: 1, points: 10 },
    { id: 'crit_15_4', nom: 'Ordre aliments', description: 'Cru avant cuit, léger avant lourd', type: 'comportement', difficulte: 2, points: 15 },
    { id: 'crit_15_5', nom: 'Jus légumes maison', description: 'Extracteur ou blender légumes frais', type: 'composition', difficulte: 2, points: 15 },
    
    // JOURS 16-20 : CONSOLIDATION
    { id: 'crit_16_1', nom: 'Psyllium ajouté', description: 'Fibres solubles dans eau', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_16_2', nom: 'Pleine conscience totale', description: 'Zéro distraction pendant 3 repas', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_16_3', nom: 'Protéines 0,8g/kg', description: 'Calculer apport protéique précis', type: 'quantite', difficulte: 3, points: 20 },
    { id: 'crit_16_4', nom: 'Oméga-3 quotidien', description: 'Lin, chia, noix ou poisson gras', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_16_5', nom: 'Pas de pain blanc', description: 'Uniquement complet ou sans gluten', type: 'extras', difficulte: 2, points: 15 },
    
    { id: 'crit_17_1', nom: 'Soupe miso', description: 'Bouillon fermenté traditionnel', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_17_2', nom: 'Jeûne hydrique 24h', description: 'Uniquement eau pendant 24h', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_17_3', nom: 'Vinaigre de cidre', description: '1 c. à soupe dans eau avant repas', type: 'hydratation', difficulte: 1, points: 10 },
    { id: 'crit_17_4', nom: 'Combinaisons alimentaires', description: 'Pas protéines + féculents', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_17_5', nom: 'Choux variés', description: 'Brocoli, chou-fleur ou kale', type: 'composition', difficulte: 1, points: 10 },
    
    { id: 'crit_18_1', nom: 'Racines anciennes', description: 'Panais, topinambour, rutabaga', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_18_2', nom: 'Silence digestif', description: 'Pas manger 4h avant coucher', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_18_3', nom: 'Enzymes digestives', description: 'Ananas, papaye ou gingembre frais', type: 'composition', difficulte: 1, points: 10 },
    { id: 'crit_18_4', nom: 'Assiette froide midi', description: 'Salade composée complète', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_18_5', nom: 'Aromates thérapeutiques', description: 'Thym, romarin, sauge', type: 'qualite', difficulte: 1, points: 10 },
    
    { id: 'crit_19_1', nom: 'Micro-jeûnes répétés', description: '3× 16h dans la semaine', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_19_2', nom: 'Levure nutritionnelle', description: 'Vitamine B12 végétale', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_19_3', nom: 'Aucun stimulant', description: 'Ni café ni thé noir', type: 'extras', difficulte: 3, points: 20 },
    { id: 'crit_19_4', nom: 'Rotation aliments', description: 'Pas 2× même aliment dans semaine', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_19_5', nom: 'Bouillon os long', description: 'Mijotage 24h pour collagène', type: 'qualite', difficulte: 2, points: 15 },
    
    { id: 'crit_20_1', nom: 'Charbon activé', description: 'Détox intestinale douce', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_20_2', nom: 'Repas soleil levant', description: 'Manger exactement au lever soleil', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_20_3', nom: 'Texture variée', description: 'Croquant, crémeux, fondant', type: 'qualite', difficulte: 1, points: 10 },
    { id: 'crit_20_4', nom: 'Portion réduite 20%', description: 'Diminuer quantité habituelle', type: 'quantite', difficulte: 3, points: 20 },
    { id: 'crit_20_5', nom: 'Fleurs comestibles', description: 'Capucine, pensée, bourrache', type: 'composition', difficulte: 2, points: 15 },
    
    // JOURS 21-25 : MAÎTRISE
    { id: 'crit_21_1', nom: 'Chlorophylle liquide', description: 'Gouttes dans eau quotidien', type: 'hydratation', difficulte: 2, points: 15 },
    { id: 'crit_21_2', nom: 'Zéro céréales', description: 'Aucun blé, riz ou céréales', type: 'extras', difficulte: 3, points: 20 },
    { id: 'crit_21_3', nom: 'Repas ritualisé', description: 'Même heure, même lieu, même durée', type: 'comportement', difficulte: 2, points: 15 },
    { id: 'crit_21_4', nom: 'Lactofermentation maison', description: 'Préparer légumes fermentés', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_21_5', nom: 'Portion unique', description: 'Se servir 1× sans resservir', type: 'quantite', difficulte: 2, points: 15 },
    
    { id: 'crit_22_1', nom: 'Curcuma + poivre', description: 'Association synergique quotidienne', type: 'composition', difficulte: 1, points: 10 },
    { id: 'crit_22_2', nom: 'Jeûne sec partiel', description: 'Pas eau 4h dans journée', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_22_3', nom: 'Aliments vivants', description: 'Uniquement crus et bio', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_22_4', nom: 'Comptage calories', description: 'Tracer précisément apports', type: 'quantite', difficulte: 3, points: 20 },
    { id: 'crit_22_5', nom: 'Visualisation repas', description: 'Imaginer digestion optimale', type: 'comportement', difficulte: 2, points: 15 },
    
    { id: 'crit_23_1', nom: 'Baies antioxydantes', description: 'Myrtilles, cranberries, mûres', type: 'composition', difficulte: 1, points: 10 },
    { id: 'crit_23_2', nom: 'Intermittence avancée', description: 'Alterner 16h/20h/24h', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_23_3', nom: 'Mono-ingrédient', description: 'Chaque aliment non transformé', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_23_4', nom: 'Assiette arc-en-ciel', description: '7 couleurs différentes', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_23_5', nom: 'Écoute signaux faim', description: 'Attendre vraie faim physiologique', type: 'comportement', difficulte: 3, points: 20 },
    
    { id: 'crit_24_1', nom: 'Silicium organique', description: 'Prêle ou ortie en infusion', type: 'hydratation', difficulte: 2, points: 15 },
    { id: 'crit_24_2', nom: 'Régime cétogène', description: 'Moins 20g glucides/jour', type: 'quantite', difficulte: 3, points: 20 },
    { id: 'crit_24_3', nom: 'Aliments alcalins', description: 'Priorité aliments pH > 7', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_24_4', nom: 'Respiration pranayama', description: '10 min avant repas', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_24_5', nom: 'Champignons médicinaux', description: 'Shiitake, reishi ou maitake', type: 'composition', difficulte: 2, points: 15 },
    
    { id: 'crit_25_1', nom: 'Repas unique jour', description: 'OMAD (One Meal A Day)', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_25_2', nom: 'Absence gluten total', description: 'Zéro blé, seigle, orge', type: 'extras', difficulte: 3, points: 20 },
    { id: 'crit_25_3', nom: 'Sel rose Himalaya', description: 'Minéraux traces complets', type: 'qualite', difficulte: 1, points: 10 },
    { id: 'crit_25_4', nom: 'Portion poing fermé', description: 'Estomac ne doit pas dépasser', type: 'quantite', difficulte: 2, points: 15 },
    { id: 'crit_25_5', nom: 'Méditation digestive', description: 'Conscience totale processus', type: 'comportement', difficulte: 3, points: 20 },
    
    // JOURS 26-30 : EXPERTISE
    { id: 'crit_26_1', nom: 'Noix fraîches activées', description: 'Trempage 12h avant consommation', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_26_2', nom: 'Jeûne lunaire', description: 'Synchroniser avec phases lune', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_26_3', nom: 'Macrobiotique principe', description: 'Yin-Yang équilibre assiette', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_26_4', nom: 'Légumes mer quotidien', description: 'Nori, kombu ou dulse', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_26_5', nom: 'Portion 1 bol japonais', description: 'Limiter volume strict', type: 'quantite', difficulte: 3, points: 20 },
    
    { id: 'crit_27_1', nom: 'Kéfir maison', description: 'Probiotiques vivants naturels', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_27_2', nom: 'Extraction jus lent', description: 'Slow juicer légumes frais', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_27_3', nom: 'Aucun fruit sucré', description: 'Uniquement baies et citron', type: 'extras', difficulte: 3, points: 20 },
    { id: 'crit_27_4', nom: 'Mastication 50×', description: 'Liquéfier complètement avant avaler', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_27_5', nom: 'Timing circadien strict', description: 'Repas synchro rythme biologique', type: 'timing', difficulte: 3, points: 20 },
    
    { id: 'crit_28_1', nom: 'Grenade ou baobab', description: 'Super-fruits antioxydants extrêmes', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_28_2', nom: 'Crudivorisme complet', description: '100% aliments crus', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_28_3', nom: 'Quantité 500 cal max', description: 'Restriction calorique sévère', type: 'quantite', difficulte: 3, points: 20 },
    { id: 'crit_28_4', nom: 'Connexion spirituelle', description: 'Prière ou bénédiction avant manger', type: 'comportement', difficulte: 2, points: 15 },
    { id: 'crit_28_5', nom: 'Élixirs floraux', description: 'Fleurs Bach digestion', type: 'hydratation', difficulte: 2, points: 15 },
    
    { id: 'crit_29_1', nom: 'Mycothérapie active', description: 'Cordyceps ou chaga', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_29_2', nom: 'Jeûne prolongé 48h', description: 'Uniquement eau 2 jours', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_29_3', nom: 'Aliments vivants enzymes', description: 'Germinations actives uniquement', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_29_4', nom: 'Respiration cohérence', description: 'Synchroniser souffle et bouchées', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_29_5', nom: 'Index insulinique bas', description: 'Tous aliments II < 30', type: 'quantite', difficulte: 3, points: 20 },
    
    { id: 'crit_30_1', nom: 'Moringa poudre', description: 'Arbre vie complet nutritionnel', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_30_2', nom: 'Silence absolu repas', description: 'Méditation active mastication', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_30_3', nom: 'Zéro huile ajoutée', description: 'Gras uniquement naturels aliments', type: 'extras', difficulte: 3, points: 20 },
    { id: 'crit_30_4', nom: 'Portion enfant', description: 'Assiette diamètre 20cm max', type: 'quantite', difficulte: 3, points: 20 },
    { id: 'crit_30_5', nom: 'Alchimie alimentaire', description: 'Intention vibratoire élevée', type: 'comportement', difficulte: 3, points: 20 },
    
    // JOURS 31-35 : TRANSCENDANCE
    { id: 'crit_31_1', nom: 'Jeûne sec 24h', description: 'Ni eau ni aliments', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_31_2', nom: 'Mono-fruit journée', description: 'Uniquement 1 type fruit', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_31_3', nom: 'Température corporelle', description: 'Aliments température corps', type: 'qualite', difficulte: 2, points: 15 },
    { id: 'crit_31_4', nom: 'Protéines végétales 100%', description: 'Aucune source animale', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_31_5', nom: 'Graines antiques', description: 'Quinoa, amarante, teff', type: 'composition', difficulte: 2, points: 15 },
    
    { id: 'crit_32_1', nom: 'Élimination totale', description: 'Transit complet observé', type: 'comportement', difficulte: 2, points: 15 },
    { id: 'crit_32_2', nom: 'Argile verte interne', description: 'Détox minérale profonde', type: 'hydratation', difficulte: 2, points: 15 },
    { id: 'crit_32_3', nom: 'Pas de combinaison', description: 'Un seul macronutriment/repas', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_32_4', nom: 'Herbes sauvages', description: 'Cueillette pissenlit, ortie, plantain', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_32_5', nom: 'Calorie restriction', description: 'Moins 1000 cal/jour', type: 'quantite', difficulte: 3, points: 20 },
    
    { id: 'crit_33_1', nom: 'Shilajit résine', description: 'Minéraux himalayens anciens', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_33_2', nom: 'Fenêtre 4h', description: 'Tous repas dans 4h', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_33_3', nom: 'Raw vegan intégral', description: 'Cru végétal exclusif', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_33_4', nom: 'Bouchée 100 mastications', description: 'Liquéfaction parfaite', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_33_5', nom: 'Aliments sacrés', description: 'Intention divine chaque aliment', type: 'comportement', difficulte: 3, points: 20 },
    
    { id: 'crit_34_1', nom: 'Poudre herbe blé', description: 'Chlorophylle concentrée vivante', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_34_2', nom: 'Jeûne alterné', description: '1 jour sur 2', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_34_3', nom: 'Bain dérivatif', description: 'Rafraîchissement périnée post-repas', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_34_4', nom: 'Aliments monoatomiques', description: 'Or blanc, ormus', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_34_5', nom: 'Portion 200g total', description: 'Poids absolu maximum', type: 'quantite', difficulte: 3, points: 20 },
    
    { id: 'crit_35_1', nom: 'Respirianisme préparation', description: 'Réduction progressive nourriture', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_35_2', nom: 'Élixir solaire', description: 'Eau exposée soleil 8h', type: 'hydratation', difficulte: 2, points: 15 },
    { id: 'crit_35_3', nom: 'Zéro acide', description: 'Aucun aliment pH < 7', type: 'extras', difficulte: 3, points: 20 },
    { id: 'crit_35_4', nom: 'Cristaux eau', description: 'Programmation vibratoire eau', type: 'hydratation', difficulte: 3, points: 20 },
    { id: 'crit_35_5', nom: 'Mantra alimentaire', description: 'Son sacré pendant mastication', type: 'comportement', difficulte: 3, points: 20 },
    
    // JOURS 36-40 : ILLUMINATION
    { id: 'crit_36_1', nom: 'Jus céleri seul', description: '500ml céleri pur à jeun', type: 'composition', difficulte: 2, points: 15 },
    { id: 'crit_36_2', nom: 'Fenêtre 2h', description: 'Warrior diet strict', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_36_3', nom: 'Aliments lumière', description: 'Uniquement biophotons élevés', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_36_4', nom: 'Méditation 1h avant', description: 'Préparation conscience élevée', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_36_5', nom: 'Pollen frais vivant', description: 'Directement ruche si possible', type: 'composition', difficulte: 3, points: 20 },
    
    { id: 'crit_37_1', nom: 'Jeûne 72h', description: '3 jours eau uniquement', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_37_2', nom: 'Alimentation pranique', description: 'Réduction 90% quantité', type: 'quantite', difficulte: 3, points: 20 },
    { id: 'crit_37_3', nom: 'Huile CBD digestive', description: 'Cannabinoïdes système digestif', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_37_4', nom: 'Position lotus repas', description: 'Méditation active alimentation', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_37_5', nom: 'Sève bouleau fraîche', description: 'Récolte directe arbre', type: 'hydratation', difficulte: 3, points: 20 },
    
    { id: 'crit_38_1', nom: 'Nectar fleurs fraîches', description: 'Essence florale comestible', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_38_2', nom: 'Repas solaire uniquement', description: 'Manger seulement si soleil visible', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_38_3', nom: 'Aliments non-duels', description: 'Transcendance yin-yang', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_38_4', nom: 'Respiration continue', description: 'Jamais arrêter pendant mastication', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_38_5', nom: '10 bouchées maximum', description: 'Limitation absolue volume', type: 'quantite', difficulte: 3, points: 20 },
    
    { id: 'crit_39_1', nom: 'Plasma marin Quinton', description: 'Eau mer isotonique', type: 'hydratation', difficulte: 3, points: 20 },
    { id: 'crit_39_2', nom: 'Jeûne conscient 5 jours', description: 'Méditation continue pendant jeûne', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_39_3', nom: 'Aliments éthériques', description: 'Vibration 999+ Hz uniquement', type: 'qualite', difficulte: 3, points: 20 },
    { id: 'crit_39_4', nom: 'Communion aliment', description: 'Fusion conscience nourriture', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_39_5', nom: 'Rosée matin collectée', description: 'Eau condensée feuilles', type: 'hydratation', difficulte: 3, points: 20 },
    
    { id: 'crit_40_1', nom: 'Ambroisie divine', description: 'Aliments état transcendantal', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_40_2', nom: 'Jeûne sec prolongé', description: '3 jours sans eau ni aliments', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_40_3', nom: 'Vision aurique aliments', description: 'Voir énergie avant consommer', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_40_4', nom: 'Quantité 50g jour', description: 'Presque inédie', type: 'quantite', difficulte: 3, points: 20 },
    { id: 'crit_40_5', nom: 'Transmutation alchimique', description: 'Transformer plomb en or digestif', type: 'comportement', difficulte: 3, points: 20 },
    
    // JOURS 41-45 : ASCENSION
    { id: 'crit_41_1', nom: 'Prana pur respiration', description: 'Nourrir uniquement air', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_41_2', nom: 'Cristaux comestibles', description: 'Minéraux structure parfaite', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_41_3', nom: 'Méditation 23h/24h', description: 'Conscience pure permanente', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_41_4', nom: 'Aliment unique mois', description: 'Mono-aliment 30 jours', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_41_5', nom: 'Portion 1 cuillère', description: 'Quantité homéopathique', type: 'quantite', difficulte: 3, points: 20 },
    
    { id: 'crit_42_1', nom: 'Lumière solaire absorbée', description: 'Sun gazing nutrition', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_42_2', nom: 'Jeûne 10 jours', description: 'Eau uniquement décade complète', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_42_3', nom: 'Corps lumière activé', description: 'Merkaba pendant alimentation', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_42_4', nom: 'Élixir immortalité', description: 'Préparation alchimique secrète', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_42_5', nom: 'Zéro matière dense', description: 'Aucun solide, liquide pur', type: 'extras', difficulte: 3, points: 20 },
    
    { id: 'crit_43_1', nom: 'Respiration lumière', description: 'Photosynthèse humaine', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_43_2', nom: 'Essence florale espace', description: 'Quintessence cosmique', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_43_3', nom: 'Fenêtre 0 minute', description: 'Aucun repas physique', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_43_4', nom: 'Fusion universelle', description: 'Conscience Une avec Tout', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_43_5', nom: 'Néant nutritionnel', description: 'Au-delà forme alimentation', type: 'quantite', difficulte: 3, points: 20 },
    
    { id: 'crit_44_1', nom: 'Inédie préparation finale', description: 'Protocole Jasmuheen adapté', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_44_2', nom: 'Alchimie divine complète', description: 'Transformation absolue être', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_44_3', nom: 'Manne céleste', description: 'Nourriture éthérique pure', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_44_4', nom: 'Transcendance faim', description: 'Au-delà besoin manger', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_44_5', nom: 'Abstinence totale', description: 'Aucun apport externe', type: 'quantite', difficulte: 3, points: 20 },
    
    { id: 'crit_45_1', nom: 'État de grâce nutritionnel', description: 'Nourri uniquement amour divin', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_45_2', nom: 'Souffle éternel', description: 'Prana cosmique unique source', type: 'composition', difficulte: 3, points: 20 },
    { id: 'crit_45_3', nom: 'Jeûne perpétuel', description: 'Libération cycle alimentaire', type: 'timing', difficulte: 3, points: 20 },
    { id: 'crit_45_4', nom: 'Cristallisation achevée', description: 'Corps cristal lumière', type: 'comportement', difficulte: 3, points: 20 },
    { id: 'crit_45_5', nom: 'Être autosuffisant', description: 'Production autonome énergie vitale', type: 'quantite', difficulte: 3, points: 20 }
  ]
};

export default referentielAliments;