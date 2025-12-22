import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'ecommerce',
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  connectionLimit: 1
});

const prisma = new PrismaClient({ adapter });

const STORE_ID = "428d2fcc-7b48-423b-93e9-8e7a9e618479";

const images = [
  "https://scontent-syd2-1.cdninstagram.com/v/t51.71878-15/589132937_814951861526177_5273343746649030889_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=108&ig_cache_key=Mzc4NTc0OTkwOTg5OTEyNTg5OQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjY0MHgxMTM2LnNkci5DMyJ9&_nc_ohc=ExK2Uo2avBUQ7kNvwHgH1Lh&_nc_oc=AdnkS-kVDjlVKyA7tqD-VMmFK78beYP6I5jIwvsowsDXzOaYVUz_9q0CyUqddUOLg48&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_Afl7eqRVKaB4kni_sm9yU6qEetlKAo7IfN9TzbTFwvq9Sw&oe=6945F855",
  "https://scontent-syd2-1.cdninstagram.com/v/t51.71878-15/587806920_895116303019925_6671013777788307371_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=108&ig_cache_key=Mzc4NTI5OTk3NTUyNTc1NTgxNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjY0MHgxMTM2LnNkci5DMyJ9&_nc_ohc=Ei4ojPlCPIgQ7kNvwFogLeS&_nc_oc=AdnBkNub6DGQxTrvv1fHYsokp6QAIqXWkoLcHeF4SemMU4zcrAO0QsH2GRBDLZKRbS0&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_Afla79x9LasV3EIC0de2IypsFUcRKnGn-Kf2KoAjRlG4_Q&oe=6945FD20",
  "https://scontent-syd2-1.cdninstagram.com/v/t51.71878-15/598982782_2037865023640525_415587732783347824_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=109&ig_cache_key=Mzc4NTI5NjU2MzkwNDAzNDUxNA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjY0MHgxMTM2LnNkci5DMyJ9&_nc_ohc=y-XilXDx6VUQ7kNvwGC6on8&_nc_oc=Adk6w-Zm2SNwr9FHaNFlkH418qYXiyxtplMjS1VPvJIcYyMJ4bLZKyOoC0ud68HG-5U&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_AfkB6g1qcvvkuLibYI28ChONFTU1JrF02HBO02M-KAWH8A&oe=6945DFBF",
  "https://scontent-syd2-1.cdninstagram.com/v/t51.82787-15/587429012_18003903635831267_8703726977130956814_n.webp?_nc_cat=103&ig_cache_key=Mzc4NTI5MjI5NTQ1MzEyODAwMw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=8IYmZBiB24QQ7kNvwGn1q9m&_nc_oc=AdlWLed8wCb4FaV1LUIpiwwfF9JsO1Lrctu83nhkhY6bpCBORTFGePSQv1WgMT8Na6E&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_AflGGZsDvef4HI5b89QlOov_NQIb2i-xicpTQrmsVvW2Qw&oe=6945EE7D",
  "https://scontent-syd2-1.cdninstagram.com/v/t51.82787-15/589903213_18003495632831267_3555789702936864941_n.webp?_nc_cat=108&ig_cache_key=Mzc4MjM4MjMxNTgwMDQ2OTkyNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=oX7feN24m4IQ7kNvwGHPWV-&_nc_oc=Admz6oB-e0ifwlrBBg_PNB50m5yA0l89-WF3-K4xYoVif9FJwDqzyutSNft5HLMjOew&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_AfkPZU7v_3l_s9R3qhlAz5evDv9yzVSpSIxBYITOjoLsiA&oe=6945DDEF",
  "https://scontent-syd2-1.cdninstagram.com/v/t51.82787-15/590403619_18002452568831267_8386306032531078240_n.webp?_nc_cat=100&ig_cache_key=Mzc3NTA3MDg1MzI0MzQxODMwOA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=rgOumYxwD04Q7kNvwGfR1UV&_nc_oc=Adk5NdGziPXbASgG4xZzAftfvB_hGo0kUFGLOiitrMDOhfFAZZx5A34D-1Gitl_vOK0&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_AfnG6SCSo9J8HWACqWALh77mt2FSv5dKDZb08BDZ66My5Q&oe=6945F88C",
  "https://scontent-syd2-1.cdninstagram.com/v/t51.82787-15/590408333_18002376566831267_9162701626315881865_n.webp?_nc_cat=108&ig_cache_key=Mzc3NDQ1MzY1OTMyMTA5NzYzMA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=Khfzty3uS30Q7kNvwHxGX6v&_nc_oc=AdmZ23BtI6QMzN1_cZ9OKzxTHRgJPB7geOI8H1ngGbhZxH6rZsuCAbHcRTvnXpjO26k&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_AflrOLiUQSntzzcKFPqZPmOxzCXa24r5LziXBcgSW9Tu6Q&oe=6945FBE0",
  "https://scontent-syd2-1.cdninstagram.com/v/t51.82787-15/561443912_17997265925831267_8706827550578176130_n.webp?_nc_cat=108&ig_cache_key=MzczODIyOTQ1OTEzMjczMDMyNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=zwHr9B6G5q0Q7kNvwF-QMc5&_nc_oc=Adn0Hvd1osyEl6cGzkX-tt_pJ9gr-Bb6EM_rHpjspjYjHmPebYRjOmG6nY4cfvwDK0I&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_Afmg2kwOrb-ZwCt78OQ2h2AmHzB3ZnTS6PPLADzz85YkRw&oe=6945D168",
  "https://scontent-syd2-1.cdninstagram.com/v/t51.71878-15/557424768_1561843498334792_2454610892529208144_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=109&ig_cache_key=MzczMzAwODUxNTUwMjAwNzQ1NQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjY0MHgxMTM2LnNkci5DMyJ9&_nc_ohc=VptANqaUvqQQ7kNvwFAWNI8&_nc_oc=Adkpz0vQLfEYlsEcTFEMgQ84rQNQxFCK_SKyEKmPrx-VEEerf4EQ-PKPP9QXtPDlboE&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_AfkOFiBIr9X8zu19Be2ElB6UozP-FVhwnEsOm4dsCbX0cw&oe=6945D729",
  "https://scontent-syd2-1.cdninstagram.com/v/t51.71878-15/551354411_1553796659364611_7454833876059676284_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=105&ig_cache_key=MzcyNjkzNzU0MzkyOTg0MTQ1MA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjY0MHgxMTM2LnNkci5DMyJ9&_nc_ohc=elptbCjWAJoQ7kNvwGl65nW&_nc_oc=Adn5ggvOH7026uHaVMh3B1zSDzocvJr9JHuuL60iRhrhyn7GYLgsutYwkrgX7A7tJh0&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-syd2-1.cdninstagram.com&_nc_gid=_v0EEktTopuIfU5KODJMDw&oh=00_AfmIN0gyVuXC1vo3_YczGUws3OD1MbIjI_v4BUWXCwnN2A&oe=6945E452"
];

const billboardImages = [
  images[3], // Seems to be square/high quality
  images[4]
];

const productImages = images.slice(0, 3).concat(images.slice(5));

async function main() {
  console.log("Seeding store: " + STORE_ID);

  // 1. Create Billboards
  const livingRoomBillboard = await prisma.billboard.create({
    data: {
      storeId: STORE_ID,
      label: "Living Room Collection",
      imageURL: billboardImages[0]
    }
  });

  const bedroomBillboard = await prisma.billboard.create({
    data: {
      storeId: STORE_ID,
      label: "Bedroom Collection",
      imageURL: billboardImages[1]
    }
  });

  console.log("Created Billboards:", livingRoomBillboard.id, bedroomBillboard.id);

  // 2. Create Categories
  const sofaCategory = await prisma.category.create({
    data: {
      storeId: STORE_ID,
      name: "Sofa",
      billboardId: livingRoomBillboard.id
    }
  });

  const bedCategory = await prisma.category.create({
    data: {
      storeId: STORE_ID,
      name: "Bed",
      billboardId: bedroomBillboard.id
    }
  });

  console.log("Created Categories:", sofaCategory.id, bedCategory.id);

  // 3. Create Filters
  const sizeFilter = await prisma.filter.create({
    data: {
      storeId: STORE_ID,
      name: "Size"
    }
  });

  const colorFilter = await prisma.filter.create({
    data: {
      storeId: STORE_ID,
      name: "Color"
    }
  });

  // 4. Create Filter Items
  const sizes = ["Single", "Double", "Queen", "King", "3 Seater", "L Shape"];
  const colors = ["Grey", "Beige", "Brown", "Blue", "Black"];

  const sizeItems = [];
  for (const size of sizes) {
    const item = await prisma.filterItem.create({
      data: {
        storeId: STORE_ID,
        filterId: sizeFilter.id,
        name: size,
        value: size
      }
    });
    sizeItems.push(item);
  }

  const colorItems = [];
  for (const color of colors) {
    const item = await prisma.filterItem.create({
      data: {
        storeId: STORE_ID,
        filterId: colorFilter.id,
        name: color,
        value: color
      }
    });
    colorItems.push(item);
  }

  console.log("Created size items: ", sizeItems.length);
  console.log("Created color items: ", colorItems.length);

  // 5. Create Products
  let count = 0;
  for (let i = 0; i < productImages.length; i++) {
    const isSofa = i % 2 === 0; // Alternate
    const categoryId = isSofa ? sofaCategory.id : bedCategory.id;
    const name = isSofa ? `Premium Sofa ${i + 1}` : `Luxury Bed ${i + 1}`;
    const price = isSofa ? (1500 + i * 100) : (2000 + i * 150);
    
    // Pick random filter items
    const randomSize = sizeItems[Math.floor(Math.random() * sizeItems.length)];
    const randomColor = colorItems[Math.floor(Math.random() * colorItems.length)];

    const product = await prisma.product.create({
      data: {
        storeId: STORE_ID,
        categoryId: categoryId,
        name: name,
        price: price,
        isFeatured: true,
        isArchived: false,
        images: {
          create: [
            {
              url: productImages[i]
            }
          ]
        },
        filterItems: {
          create: [
            { filterItemId: randomSize.id },
            { filterItemId: randomColor.id }
          ]
        }
      }
    });
    count++;
  }

  console.log(`Created ${count} products.`);
}

main()
  .then(() => console.log("Seeding completed."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
