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

export default function BarSidebar(props: any) {
  // remove circle-related props so DesignPanel doesn't render circle controls for Bar charts
  const rest = { ...props };
  delete rest.circlesColor;
  delete rest.setCirclesColor;
  delete rest.circlesFillColor;
  delete rest.setCirclesFillColor;

  return (
    <div>
      <DataPanel {...rest} />
      <DescriptionPanel {...rest} />
      <DesignPanel {...rest} />
      <FilterPanel />
      <OptionsPanel />
      <AnimationPanel />
    </div>
  );
}
