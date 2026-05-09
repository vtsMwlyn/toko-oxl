import{r as j,j as e}from"./app-D2BE8Wz2.js";import{P as g}from"./PrimaryButton-BdrbDKXS.js";import{f as r}from"./formatPrice-CMguDEyu.js";import{P as y}from"./printer-BW0tih4u.js";import"./createLucideIcon-CVUPOlw4.js";function u({dashed:n=!1}){return e.jsx("div",{style:{borderTop:n?"1px dashed #ccc":"1px solid #000",margin:"6px 0"}})}function i({label:n,value:c,bold:o=!1}){return e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"11px",fontWeight:o?"700":"400",margin:"1px 0"},children:[e.jsx("span",{children:n}),e.jsx("span",{children:c})]})}function b({sale:n,products:c}){const o=n.items?.filter(t=>t.type==="Sell")??[],a=n.items?.filter(t=>t.type==="Return")??[],x=o.reduce((t,s)=>t+(s.price-(s.discount??0))*s.qty,0),p=a.reduce((t,s)=>t+(s.price-(s.discount??0))*s.qty,0),l=x-p,h={fontFamily:"'Courier New', Courier, monospace",fontSize:"11px",color:"#000",lineHeight:"1.4"};return e.jsxs("div",{style:{...h,width:"100%",marginLeft:"-15px",marginTop:"-20px"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"6px"},children:[e.jsx("p",{style:{fontSize:"15px",fontWeight:"700",margin:"0 0 2px"},children:"Toko OXL"}),e.jsx("p",{style:{fontSize:"10px",margin:0},children:"Toko Perlengkapan Alat Muslim"})]}),e.jsx(u,{}),e.jsx(i,{label:"Tanggal",value:n.date}),e.jsx(i,{label:"Waktu",value:n.time}),n.customer_name&&e.jsx(i,{label:"Pelanggan",value:n.customer_name}),e.jsx(i,{label:"Status",value:n.status==="Fixed"?"Lunas":"Draft"}),o.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(u,{dashed:!0}),e.jsx("p",{style:{fontSize:"10px",fontWeight:"700",margin:"3px 0",textTransform:"uppercase",letterSpacing:"0.5px"},children:"Produk Terjual"}),o.map((t,s)=>{const d=c.find(m=>m.id===t.product_id),f=(t.price-(t.discount??0))*t.qty;return e.jsxs("div",{style:{marginBottom:"4px"},children:[e.jsxs("p",{style:{margin:"0",fontWeight:"600",fontSize:"11px"},children:[d?.name??"—",d?.variant?` (${d.variant})`:""]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#333"},children:[e.jsxs("span",{children:[t.qty," x ",r(t.price),t.discount>0?` - ${r(t.discount)}`:""]}),e.jsx("span",{style:{fontWeight:"600"},children:r(f)})]})]},s)}),e.jsx(i,{label:"Subtotal",value:r(x)})]}),a.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(u,{dashed:!0}),e.jsx("p",{style:{fontSize:"10px",fontWeight:"700",margin:"3px 0",textTransform:"uppercase",letterSpacing:"0.5px"},children:"Produk Retur"}),a.map((t,s)=>{const d=c.find(m=>m.id===t.product_id),f=(t.price-(t.discount??0))*t.qty;return e.jsxs("div",{style:{marginBottom:"4px"},children:[e.jsxs("p",{style:{margin:"0",fontWeight:"600",fontSize:"11px"},children:[d?.name??"—",d?.variant?` (${d.variant})`:""]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#333"},children:[e.jsxs("span",{children:[t.qty," x ",r(t.price),t.discount>0?` - ${r(t.discount)}`:""]}),e.jsxs("span",{style:{fontWeight:"600"},children:["- ",r(f)]})]})]},s)}),e.jsx(i,{label:"Subtotal Retur",value:`- ${r(p)}`})]}),e.jsx(u,{}),a.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(i,{label:"Total Penjualan",value:r(x)}),e.jsx(i,{label:"Total Retur",value:`- ${r(p)}`})]}),e.jsx(i,{label:"TOTAL",value:r(l),bold:!0}),e.jsx(u,{}),e.jsx("p",{style:{textAlign:"center",fontSize:"10px",marginTop:"6px"},children:"Terima kasih atas pembelian Anda!"}),e.jsx("p",{style:{textAlign:"center",fontSize:"10px"},children:"Barang yang sudah dibeli tidak dapat dikembalikan."}),e.jsx("p",{style:{textAlign:"center",fontSize:"10px"},children:"--oOOo--"})]})}function w({icon:n=!1,sale:c,products:o}){const a=j.useRef(null);function x(){const p=a.current?.innerHTML;if(!p)return;const l=window.open("","_blank","width=900,height=700");l.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Struk Penjualan</title>
                <style>
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        padding: 4mm;
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 11px;
                        color: #000;
                        background: #fff;
                        width: 80mm;
                    }
                    @media print {
                        body { width: 80mm; }
                    }
                </style>
            </head>
            <body>${p}</body>
            </html>
        `),l.document.close(),l.focus(),setTimeout(()=>{l.print(),l.close()},250)}return e.jsxs(e.Fragment,{children:[e.jsx(g,{type:"button",styled:!n,icon:e.jsx(y,{className:`size-4 ${n?"stroke-emerald-600":"stroke-white"}`}),onClick:x,children:n?"":"Cetak Struk"}),e.jsx("div",{ref:a,style:{position:"absolute",left:"-9999px",top:0},children:e.jsx(b,{sale:c,products:o})})]})}export{w as default};
