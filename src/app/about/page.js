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

        <h1 className={styles.title}>
        Crunch, Crackle, Crumble - The Luscious Sounds of Kilmaine Kakes
        </h1>
        <p className={styles.desc}>
        At Kilmaine Kakes, the bakers are constantly exploring new flavor combinations and creative twists on traditional recipes, daring to push the boundaries of what a bakery can offer. Their culinary artisans let their imaginations run wild, sizzling up innovative treats that tantalize the taste buds with each bite.
However, amidst their whirlwind of inventiveness, Kilmaine Kakes remains grounded in the time-honored recipes that have made them a beloved institution.
</p>
<p className={styles.desc}>
Come meet us! - Castle Park Rd, Bangor BT20 4TD
<br></br>
Talk to us! - 0345 600 7555
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
