import{r as f,j as e}from"./app-DuXb0O30.js";import{P as h}from"./PrimaryButton--u3EL70-.js";import{f as c}from"./formatPrice-CMguDEyu.js";import{P as g}from"./printer-BcydEHUx.js";import"./createLucideIcon-C_1SEXEl.js";function l({dashed:t=!1}){return e.jsx("div",{style:{borderTop:t?"1px dashed #ccc":"1px solid #000",margin:"6px 0"}})}function d({label:t,value:a,bold:s=!1}){return e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"11px",fontWeight:s?"700":"400",margin:"1px 0"},children:[e.jsx("span",{children:t}),e.jsx("span",{children:a})]})}function j({sale:t,products:a}){const s=t.items?.filter(n=>n.type==="Sell")??[],x=s.reduce((n,r)=>n+(r.price-(r.discount??0))*r.qty,0),p={fontFamily:"'Courier New', Courier, monospace",fontSize:"11px",color:"#000",lineHeight:"1.4"};return e.jsxs("div",{style:{...p,width:"100%",marginLeft:"-15px",marginTop:"-20px"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"6px"},children:[e.jsx("p",{style:{fontSize:"15px",fontWeight:"700",margin:"0 0 2px"},children:"Toko OXL"}),e.jsx("p",{style:{fontSize:"10px",margin:"0 0 2px"},children:"Toko Perlengkapan Alat Muslim"}),e.jsxs("p",{style:{fontSize:"9px",margin:0,color:"#444"},children:["Jl. Adi Sucipta No.6, Pamoyanan, Kec. Cianjur,",`
`,"Kabupaten Cianjur, Jawa Barat 43212"]})]}),e.jsx(l,{}),e.jsx(d,{label:"Tanggal",value:t.date}),e.jsx(d,{label:"Waktu",value:t.time}),t.customer_name&&e.jsx(d,{label:"Pelanggan",value:t.customer_name}),e.jsx(d,{label:"Status",value:t.status==="Fixed"?"Lunas":"Draft"}),s.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(l,{dashed:!0}),s.map((n,r)=>{const i=a.flatMap(o=>o.variants).find(o=>o.id===n.variant_id),u=a.find(o=>o.id===i?.product_id),m=(n.price-(n.discount??0))*n.qty;return e.jsxs("div",{style:{marginBottom:"4px"},children:[e.jsxs("p",{style:{margin:"0",fontWeight:"600",fontSize:"11px"},children:[u?.name??"—",i?.name?` (${i.name})`:""]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"#333"},children:[e.jsxs("span",{children:[n.qty," x ",c(n.price),n.discount>0?` - ${c(n.discount)}`:""]}),e.jsx("span",{style:{fontWeight:"600"},children:c(m)})]})]},r)})]}),e.jsx(l,{}),e.jsx(d,{label:"TOTAL",value:c(x),bold:!0}),e.jsx(l,{}),e.jsx("p",{style:{textAlign:"center",fontSize:"10px",marginTop:"6px"},children:"Terima kasih atas pembelian Anda!"}),e.jsx("p",{style:{textAlign:"center",fontSize:"10px"},children:"Barang yang sudah dibeli tidak dapat dikembalikan."}),e.jsx(l,{dashed:!0}),t.queue_number&&e.jsxs("div",{style:{textAlign:"center",marginTop:"8px"},children:[e.jsx("p",{style:{fontSize:"10px",margin:"0 0 2px",color:"#555"},children:"Nomor Antrian"}),e.jsx("p",{style:{fontSize:"48px",fontWeight:"700",margin:0,lineHeight:"1"},children:t.queue_number})]}),e.jsx("p",{style:{textAlign:"center",fontSize:"10px",marginTop:"8px"},children:"--oOOo--"})]})}function z({icon:t=!1,sale:a,products:s,onPrinted:x}){const p=f.useRef(null);function n(){const r=p.current?.innerHTML;if(!r)return;const i=window.open("","_blank","width=900,height=700");i.document.write(`
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
            <body>${r}</body>
            </html>
        `),i.document.close(),i.focus(),setTimeout(()=>{i.print(),i.close(),x?.()},250)}return e.jsxs(e.Fragment,{children:[e.jsx(h,{type:"button",styled:!t,icon:e.jsx(g,{className:`size-4 ${t?"stroke-emerald-600":"stroke-white"}`}),onClick:n,children:t?"":"Cetak Struk"}),e.jsx("div",{ref:p,style:{position:"absolute",left:"-9999px",top:0},children:e.jsx(j,{sale:a,products:s})})]})}export{z as default};
