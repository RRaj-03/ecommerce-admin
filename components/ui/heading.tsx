import React from "react";

const Heading = ({ title, desc }: { title: string; desc: string }) => {
  return (
    <div>
      <h2 className="font-bold text-3xl tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
};

export default Heading;
