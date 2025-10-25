// micromark-math-latex.js

function mathLatex() {
  return {
    text: {
      92: {
        // backslash
        name: "mathLatex",
        tokenize: tokenizeMath,
        resolveAll: resolveAllMath,
      },
    },
    // CRITICAL: Disable escape for our patterns
    disable: {
      null: ["characterEscape"],
    },
  };
}

function resolveAllMath(events) {
  console.log("🔍 resolveAllMath called with events:", events);
  return events;
}

function tokenizeMath(effects, ok, nok) {
  let isInline = false;

  return start;

  function start(code) {
    if (code !== 92) return nok(code);
    effects.enter("mathLatex");
    effects.consume(code);
    return afterBackslash;
  }

  function afterBackslash(code) {
    if (code === 40) {
      // (
      isInline = true;
      effects.consume(code);
      return insideMath;
    }
    if (code === 91) {
      // [
      isInline = false;
      effects.consume(code);
      return insideMath;
    }
    return nok(code);
  }

  function insideMath(code) {
    if (code === null) return nok(code);

    if (code === 92) {
      // backslash - consume it first
      effects.consume(code);
      return maybeEnd;
    }

    effects.consume(code);
    return insideMath;
  }

  function maybeEnd(code) {
    const expectedClose = isInline ? 41 : 93; // ) or ]

    if (code === expectedClose) {
      effects.consume(code);
      effects.exit("mathLatex");
      return ok;
    }

    // False alarm - continue
    return insideMath(code);
  }
}

export const mathLatexSyntax = mathLatex();

export function mathLatexFromMarkdown() {
  return {
    enter: {
      mathLatex(token) {
        console.log("🔍 ENTER mathLatex");
        this.enter({ type: "mathLatex", value: "" }, token);
      },
      mathLatexValue(token) {
        console.log("🔍 ENTER mathLatexValue");
        this.config.enter.data.call(this, token);
      },
    },
    exit: {
      mathLatexValue(token) {
        console.log("🔍 EXIT mathLatexValue");
        this.config.exit.data.call(this, token);
      },
      mathLatex(token) {
        console.log("🔍 EXIT mathLatex, token:", token);
        const node = this.exit(token);
        const value = this.sliceSerialize(token);
        console.log("🔍 Serialized:", value);

        if (value.startsWith("\\(")) {
          node.type = "inlineMath";
          node.value = value.slice(2, -2);
        } else if (value.startsWith("\\[")) {
          node.type = "math";
          node.value = value.slice(2, -2);
        }
        console.log("🔍 Final node:", node);
      },
    },
  };
}
