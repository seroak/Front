import cx from "classnames";
import styles from "./PrintBox.module.css";
import { PrintItem } from "@/pages/Home/types/printItem";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  printItem: PrintItem;
};
/**
 *
 * @param param0 (@link PrintItem)
 * @returns
 */

function printBox({ printItem }: Props) {
  return (
    <AnimatePresence key={printItem.id} mode="wait">
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cx("code-flow", "code-flow-text")}
      >
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="code-flow-title-wrap"
        >
          <motion.div className="code-flow-title">
            <span>print</span>
          </motion.div>
        </motion.div>
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="code-flow-data"
        >
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.print_expr}
          >
            {printItem.expr.split("").map((char, index) => (
              <span
                key={index}
                className={cx(printItem.isLight && printItem.highlights?.includes(index) && styles.font_highlight)}
                style={{ whiteSpace: "pre" }}
              >
                {char}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default printBox;
