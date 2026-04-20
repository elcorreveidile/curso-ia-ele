import React from 'react';

export default function PageHero({ tag, title, desc }) {
  return (
    <div className="page-hero">
      <div className="page-hero__inner">
        {tag && <p className="page-hero__tag">{tag}</p>}
        <h1 className="page-hero__title">{title}</h1>
        {desc && <p className="page-hero__desc">{desc}</p>}
      </div>
    </div>
  );
}
