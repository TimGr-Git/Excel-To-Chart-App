/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  DataPanel,
  DescriptionPanel,
  DesignPanel,
  FilterPanel,
  OptionsPanel,
  AnimationPanel,
} from "..";

export default function LineSidebar(props: any) {
  // props are forwarded to child panels; keep typing minimal for safe incremental refactor
  return (
    <div>
      <DataPanel {...props} />
      <DescriptionPanel {...props} />
      <DesignPanel {...props} />
      <FilterPanel />
      <OptionsPanel />
      <AnimationPanel />
    </div>
  );
}
