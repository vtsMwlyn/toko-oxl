import{r as j,j as e}from"./app-DuXb0O30.js";import{P as w}from"./Popup-CehQLshF.js";import{P as C}from"./PrimaryButton--u3EL70-.js";import{T as o}from"./TextInput-CBvR7Kw-.js";import{f as N}from"./formatPrice-CMguDEyu.js";import{P as k}from"./printer-BcydEHUx.js";import"./transition-CWzCwMuE.js";import"./x-R08wA_cT.js";import"./createLucideIcon-C_1SEXEl.js";function I({variant:h,product:p,isOpen:u,onClose:m}){const[t,g]=j.useState({qty:1,widthCm:4,heightCm:1.5,gapMm:4}),l=i=>{const{name:a,value:s}=i.target;g(r=>({...r,[a]:s}))},b=()=>{const i=parseInt(t.qty,10),a=parseFloat(t.widthCm),s=parseFloat(t.heightCm),r=parseFloat(t.gapMm);if(isNaN(i)||i<=0)return alert("Jumlah copy tidak valid.");if(isNaN(a)||a<=0)return alert("Ukuran lebar tidak valid.");if(isNaN(s)||s<=0)return alert("Ukuran tinggi tidak valid.");if(isNaN(r)||r<0)return alert("Ukuran gap tidak valid.");m();const f=Array(i).fill(h),n=document.createElement("iframe");n.style.display="none",document.body.appendChild(n);const x=f.map((c,v)=>`
            <div class="label">
                <svg class="barcode" id="bc-${v}" data-barcode="${c.barcode}"></svg>
                <p class="name">${p.name}${c.variant?` — ${c.variant}`:""}</p>
                <p class="price">${N(p.normal_price??0)}</p>
            </div>
        `).join(""),y=`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Cetak Barcode Produk</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"><\/script>
                <style>
                    @page { size: A4; margin: 8mm; }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; background: #fff; }

                    .grid { display: flex; flex-wrap: wrap; gap: ${r}mm; }
                    .label {
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        padding: 4mm 3mm 3mm;
                        text-align: center;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .barcode {
                        width: ${a}cm !important;
                        height: ${s}cm !important;
                    }

                    .name { font-size: 7pt; color: #555; margin-top: 1mm; max-width: ${a}cm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .price { font-size: 8pt; font-weight: 700; color: #000; margin-top: 1mm; }
                </style>
            </head>
            <body>
                <div class="grid" style="padding: 4mm;">
                    ${x}
                </div>
                <script>
                    document.querySelectorAll('.barcode').forEach(function(svg) {
                        try {
                            JsBarcode(svg, svg.dataset.barcode, {
                                format:      'EAN13',
                                width:       2,
                                height:      50,
                                displayValue: true,
                                margin:      2,
                            });
                        } catch(e) {
                            svg.outerHTML = '<p style="color:red;font-size:8pt;">Invalid</p>';
                        }
                    });

                    setTimeout(function() {
                        window.print();
                    }, 500);
                <\/script>
            </body>
            </html>
        `,d=n.contentWindow.document;d.open(),d.write(y),d.close(),n.contentWindow.onafterprint=()=>{document.body.removeChild(n)}};return e.jsxs(w,{title:"Pengaturan Cetak",isOpen:u,onClose:m,className:"max-w-sm",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Jumlah Copy"}),e.jsx(o,{type:"number",name:"qty",value:t.qty,onChange:l,className:" w-full",min:"1"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Lebar (cm)"}),e.jsx(o,{type:"number",name:"widthCm",value:t.widthCm,onChange:l,className:" w-full",step:"0.1"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Tinggi (cm)"}),e.jsx(o,{type:"number",name:"heightCm",value:t.heightCm,onChange:l,className:" w-full",step:"0.1"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Gap (mm)"}),e.jsx(o,{type:"number",name:"gapMm",value:t.gapMm,onChange:l,className:" w-full",step:"0.5",min:"0"})]})]})]}),e.jsxs("div",{className:"mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100",children:[e.jsx("button",{type:"button",onClick:m,className:"px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors",children:"Batal"}),e.jsx(C,{icon:e.jsx(k,{className:"size-4"}),type:"button",onClick:b,children:"Lanjut Cetak"})]})]})}export{I as default};
