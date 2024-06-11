"use client";

import cx from "classnames";
import styles from "./PrintBox.module.css";
type Props = { expr: string; highlight: number[]; lightOn: boolean };
function printBox({ expr, highlight, lightOn }: Props) {
  return (
    <div className={styles.print_box}>
      <div className={cx(styles.print_border, lightOn && styles.highlight)}>
        <span className={styles.print_text}>print</span>
        <div className={styles.textOutput}>
          {expr.split("").map((char, index) => (
            <span
              key={index}
              className={cx(
                lightOn && highlight.includes(index) && styles.font_highlight
              )}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default printBox;