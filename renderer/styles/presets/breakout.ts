export { breakoutGrid };

import { Preset } from "unocss";

const rules: Preset["rules"] = [
  [
    /^bk-container-\[([^\[\]]*)\]$/,
    ([, d]) => {
      const columns = d.split(",");
      const dv: Record<string, string> = {};

      const __steps = (column: string) => {
        // get the difference between the current column and the content column
        // const __step_01 = `calc(var(--${column}-val) - var(--content-max-width))`;
        const __step_01 = `(var(--${column}-val) - var(--content-max-width))`;
        const __step_02 = `(var(--${column}-val) - var(--${column}-step_01))`;
        const __step_03 = `(var(--${column}-step_02) - var(--content-max-width))`;
        const __step_04 = `minmax(0, calc(var(--${column}-step_03) / 2))`;
        return { __step_01, __step_02, __step_03, __step_04 };
      };

      // get the difference values
      for (var i = 0; i < columns.length; i++) {
        dv[`--${columns[i - 1]}-step_01`] = __steps(columns[i]).__step_01;
        dv[`--${columns[i]}-step_02`] = __steps(columns[i]).__step_02;
        dv[`--${columns[i]}-step_03`] = __steps(columns[i]).__step_03;
        dv[`--${columns[i]}`] = __steps(columns[i]).__step_04;

        if (i === columns.length - 1) {
          const name = `--${columns[i]}`;
          const __01 = `(var(--${columns[i]}-val) - var(--content-max-width))`;
          dv[name] = `minmax(0, calc(${__01} / 2))`;
        }
      }

      const __start = columns.map(
        (column) => `[${column}-start] var(--${column})`
      );

      const __end = columns
        .reverse()
        .map((column) => `var(--${column}) [${column}-end]`);

      const result = [
        __start.join(" "),
        "[content-start] var(--content) [content-end]",
        __end.join(" "),
      ].join(" ");

      // --- root
      const rootStart = "[root-start] var(--root)";
      const rootEnd = "var(--root) [root-end]";

      return {
        ...dv,
        "--gap": "1.25em",
        "--root": "minmax(var(--gap), 1fr)",
        display: "grid",
        "align-content": "flex-start",
        "grid-template-columns": rootStart + " " + result + " " + rootEnd,
      };
    },
  ],
  [
    /^bk-values-([a-z]+)-(.+)$/,
    ([, m, t]) => {
      const obj: Record<any, any> = {};
      var d = t.replace(/[\]}[{]/g, "").replaceAll("_", " ");
      obj[`--${m}-val`] = `${d}${Number(d) ? "px" : ""}`;

      // obj[`--${m}`] = `minmax(0, calc((${d}${
      //   Number(d) ? "px" : ""
      // } - var(--content-max-width)) / 2))`;
      return obj;
    },
  ],
  [
    /^bk-content-(boundary|bleed|[0-9]+)$/,
    ([, d]) => {
      var cnt = d;

      if (!Number(d)) cnt = `var(--boundary${d === "bleed" ? "-bleed" : ""})`;
      else cnt = d + "px";

      return {
        "--cnt": `${cnt}`,
        "--content": `min(${cnt}, 100% - var(--gap) * 2)`,
        "--content-max-width": `${cnt}`,
      };
    },
    {
      autocomplete: "bk-content-(boundary|bleed)",
    },
  ],
  [
    /^bk-container--inherit/,
    ([, d]) => ({
      display: "grid",
      "align-content": "inherit",
      "grid-template-columns": "inherit",
    }),
    {
      internal: true,
    },
  ],
  [
    /^bk-content-inherit/,
    ([, d]) => {
      const content = "[content-start] var(--content) [content-end]";
      const rootStart = "[root-start] var(--root)";
      const rootEnd = "var(--root) [root-end]";

      return {
        "--gap": "1.25em",
        "--root": "minmax(var(--gap), 1fr)",
        display: "grid",
        "align-content": "flex-start",
        "grid-template-columns": rootStart + " " + content + " " + rootEnd,
      };
    },
    {
      internal: true,
    },
  ],
];

const shortcuts: Preset["shortcuts"] = [
  [/^bk-col-([a-z]+)$/, ([, c]) => `grid-col-[${c}]`],
  {
    "bk-inherit": "bk-content-inherit [&_>_*]:bk-col-content",
    "bk-container-inherit":
      "bk-container--inherit bk-col-root! [&_>_*]:bk-col-content",
  },
];

const breakoutGrid: Preset = {
  name: "breakout-grid",
  rules,
  shortcuts,
};
