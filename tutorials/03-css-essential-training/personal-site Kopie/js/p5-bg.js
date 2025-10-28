let pts=[];
let cols,rows,spacing=56;
let t=0;
let reduceMotion=false;

function setup(){
  const c=createCanvas(windowWidth,windowHeight);
  c.parent('p5-background');
  pixelDensity(1);
  reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  initGrid();
  noFill();
  strokeCap(ROUND);
}

function initGrid(){
  pts.length=0;
  cols=floor(width/spacing)+2;
  rows=floor(height/spacing)+2;
  const gridW=(cols-1)*spacing;
  const gridH=(rows-1)*spacing;
  const x0=(width-gridW)*0.5;
  const y0=(height-gridH)*0.5;
  for(let j=0;j<rows;j++){
    for(let i=0;i<cols;i++){
      const x=x0+i*spacing;
      const y=y0+j*spacing;
      pts.push({x,y,ox:x,oy:y});
    }
  }
}

function draw(){
  clear();
  const time=reduceMotion?0:(t+=0.005);
  for(const p of pts){
    const n=noise(p.ox*0.0035,p.oy*0.0035,time);
    const a=(n-0.5)*TWO_PI*0.04;
    const r=7*(n-0.5);
    p.x=p.ox+cos(a)*r;
    p.y=p.oy+sin(a)*r;
  }
  const nearR2=90*90;
  stroke(255,255,255,40);
  strokeWeight(1);
  for(let a=0;a<pts.length;a++){
    const pa=pts[a];
    for(let b=a+1;b<pts.length;b++){
      const pb=pts[b];
      if(Math.abs(pa.ox-pb.ox)>spacing+1||Math.abs(pa.oy-pb.oy)>spacing+1)continue;
      const dx=pa.x-pb.x,dy=pa.y-pb.y;
      const d2=dx*dx+dy*dy;
      if(d2<nearR2){
        const alpha=map(d2,0,nearR2,140,20);
        stroke(255,255,255,alpha*0.6);
        line(pa.x,pa.y,pb.x,pb.y);
      }
    }
  }
  noStroke();
  const mouseR=120;
  for(const p of pts){
    const dm=dist(p.x,p.y,mouseX,mouseY);
    if(dm<mouseR){
      const k=map(dm,0,mouseR,1,0);
      fill(228,0,43,120+110*k);
      circle(p.x,p.y,3.6+2.2*k);
    }else{
      fill(255,255,255,60);
      circle(p.x,p.y,3);
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
  initGrid();
}
