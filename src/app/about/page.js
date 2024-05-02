import Image from "next/image";
import styles from "./about.module.css";

export const metadata = {
  title: "About Page",
  description: "About description",
};


const AboutPage = () => {

  return (
    <div className={styles.container}>
      <div className={styles.textContainer}>
        <h2 className={styles.subtitle}>Kilmaine Kakes</h2>
        <h1 className={styles.title}>
        Crunch, Crackle, Crumble - The Luscious Sounds of Kilmaine Kakes
        </h1>
        <p className={styles.desc}>
        At Kilmaine Kakes, the bakers are constantly exploring new flavor combinations and creative twists on traditional recipes, daring to push the boundaries of what a bakery can offer. Their culinary artisans let their imaginations run wild, sizzling up innovative treats that tantalize the taste buds with each bite.
However, amidst their whirlwind of inventiveness, Kilmaine Kakes remains grounded in the time-honored recipes that have made them a beloved institution. Their master bakers meticulously craft each batch, ensuring every classic offering adheres to the highest standards of quality and authenticity.
From the gentle whoosh of whisks folding in rich, velvety batters to the soothing sizzle of fragrant spices being toasted to perfection, the bakery hums with the harmonious melodies of culinary creation. It's this delicate balance of cherishing tradition while blazing new trails that makes Kilmaine Kakes a truly unique and unforgettable experience for sweet aficionados near and far.
        </p>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <h1>2 K+</h1>
            <p>Customers and counting</p>
          </div>
          <div className={styles.box}>
            <h1>4</h1>
            <p>Years of experience</p>
          </div>
          <div className={styles.box}>
            <h1>over 30</h1>
            <p>New items introduced</p>
          </div>
        </div>
      </div>
      <div className={styles.imgContainer}>
        <Image
          src="/logo.jpeg"
          alt="Kilmaine Kakes logo"
          fill
          className={styles.img}
        />
      </div>
    </div>
  );
};

export default AboutPage;
