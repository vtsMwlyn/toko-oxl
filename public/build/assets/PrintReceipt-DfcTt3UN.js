import{r as g,j as e}from"./app-B8FPMgmO.js";import{P as y}from"./PrimaryButton-u_MmmiFP.js";import{f as r}from"./formatPrice-CMguDEyu.js";import{P as b}from"./printer-BkUzMLyz.js";import"./createLucideIcon-DRxW9iW7.js";function x({dashed:n=!1}){return e.jsx("div",{style:{borderTop:n?"1px dashed #ccc":"1px solid #000",margin:"6px 0"}})}function a({label:n,value:o,bold:l=!1}){return e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"11px",fontWeight:l?"700":"400",margin:"1px 0"},children:[e.jsx("span",{children:n}),e.jsx("span",{children:o})]})}function v({sale:n,products:o}){const l=n.items?.filter(t=>t.type==="Sell")??[],p=n.items?.filter(t=>t.type==="Return")??[],u=l.reduce((t,i)=>t+(i.price-(i.discount??0))*i.qty,0),m=p.reduce((t,i)=>t+(i.price-(i.discount??0))*i.qty,0),f=u-m,d={fontFamily:"'Courier New', Courier, monospace",fontSize:"11px",color:"#000",lineHeight:"1.4"};return e.jsxs("div",{style:{...d,width:"100%",marginLeft:"-15px",marginTop:"-20px"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"6px"},children:[e.jsx("p",{style:{fontSize:"15px",fontWeight:"700",margin:"0 0 2px"},children:"Toko OXL"}),e.jsx("p",{style:{fontSize:"10px",margin:"0 0 2px"},children:"Toko Perlengkapan Alat Muslim"}),e.jsxs("p",{style:{fontSize:"9px",margin:0,color:"#444"},children:["Jl. Adi Sucipta No.6, Pamoyanan, Kec. Cianjur,",`
`,"Kabupaten Cianjur, Jawa Barat 43212"]})]}),e.jsx(x,{}),e.jsx(a,{label:"Tanggal",value:n.date}),e.jsx(a,{label:"Waktu",value:n.time}),n.customer_name&&e.jsx(a,{label:"Pelanggan",value:n.customer_name}),e.jsx(a,{label:"Status",value:n.status==="Fixed"?"Lunas":"Draft"}),n.cashier_name&&e.jsx(a,{label:"Kasir",value:n.cashier_name}),n.queue_number&&e.jsx(a,{label:"No. Antrian",value:n.queue_number}),l.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(x,{dashed:!0}),l.map((t,i)=>{const c=o.flatMap(s=>s.variants).find(s=>s.id===t.variant_id),h=o.find(s=>s.id===c?.product_id),j=(t.price-(t.discount??0))*t.qty;return e.jsxs("div",{style:{marginBottom:"4px"},children:[e.jsxs("p",{style:{margin:"0",fontWeight:"600",fontSize:"11px"},children:[h?.name??"—",c?.name?` (${c.name})`:""]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#333"},children:[e.jsxs("span",{children:[t.qty," x ",r(t.price),t.discount>0?` - ${r(t.discount)}`:""]}),e.jsx("span",{style:{fontWeight:"600"},children:r(j)})]})]},i)})]}),e.jsx(x,{}),p.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(x,{dashed:!0}),e.jsx("p",{style:{fontSize:"10px",fontWeight:"700",margin:"3px 0",textTransform:"uppercase",letterSpacing:"0.5px"},children:"Produk Retur"}),p.map((t,i)=>{const c=o.flatMap(s=>s.variants).find(s=>s.id===t.variant_id),h=o.find(s=>s.id===c?.product_id),j=(t.price-(t.discount??0))*t.qty;return e.jsxs("div",{style:{marginBottom:"4px"},children:[e.jsxs("p",{style:{margin:"0",fontWeight:"600",fontSize:"11px"},children:[h?.name??"—",c?.name?` (${c.name})`:""]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#333"},children:[e.jsxs("span",{children:[t.qty," x ",r(t.price),t.discount>0?` - ${r(t.discount)}`:""]}),e.jsxs("span",{style:{fontWeight:"600"},children:["- ",r(j)]})]})]},i)})]}),p.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Total Penjualan",value:r(u)}),e.jsx(a,{label:"Total Retur",value:`- ${r(m)}`})]}),e.jsx(a,{label:"TOTAL",value:r(f),bold:!0}),e.jsx(x,{}),e.jsx("p",{style:{textAlign:"center",fontSize:"10px",marginTop:"6px"},children:"Terima kasih atas pembelian Anda!"}),e.jsx("p",{style:{textAlign:"center",fontSize:"10px"},children:"Barang yang sudah dibeli tidak dapat dikembalikan."}),e.jsx(x,{dashed:!0}),e.jsx("p",{style:{textAlign:"center",fontSize:"10px",marginTop:"8px"},children:"--oOOo--"})]})}function P({icon:n=!1,sale:o,products:l,onPrinted:p}){const u=g.useRef(null);function m(){const f=u.current?.innerHTML;if(!f)return;const d=window.open("","_blank","width=900,height=700");d.document.write(`
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
            <body>${f}</body>
            </html>
        `),d.document.close(),d.focus(),setTimeout(()=>{d.print(),d.close(),p?.()},250)}return e.jsxs(e.Fragment,{children:[e.jsx(y,{type:"button",styled:!n,icon:e.jsx(b,{className:`size-4 ${n?"stroke-emerald-600":"stroke-white"}`}),onClick:m,children:n?"":"Cetak Struk"}),e.jsx("div",{ref:u,style:{position:"absolute",left:"-9999px",top:0},children:e.jsx(v,{sale:o,products:l})})]})}export{P as default};
