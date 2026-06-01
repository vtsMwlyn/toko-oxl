import{r as v,j as e}from"./app-Bpwcs4io.js";import{P as j}from"./Popup-DGwr2mni.js";import{P as N}from"./PrimaryButton-DnufAyNX.js";import{T as m}from"./TextInput-CSbSaJT7.js";import{P as C}from"./printer-CXUJSUw9.js";import"./transition-BcgqUQaW.js";import"./x-DQEbsjy_.js";import"./createLucideIcon-C39Ahypb.js";function T({variant:c,isOpen:p,onClose:o}){const[t,u]=v.useState({qty:1,widthCm:4,heightCm:1.5,gapMm:4,marginMm:8}),s=i=>{const{name:r,value:n}=i.target;u(l=>({...l,[r]:n}))},g=()=>{const i=parseInt(t.qty,10),r=parseFloat(t.widthCm),n=parseFloat(t.heightCm),l=parseFloat(t.gapMm),d=parseFloat(t.marginMm);if(isNaN(i)||i<=0)return alert("Jumlah copy tidak valid.");if(isNaN(r)||r<=0)return alert("Ukuran lebar tidak valid.");if(isNaN(n)||n<=0)return alert("Ukuran tinggi tidak valid.");if(isNaN(l)||l<0)return alert("Ukuran gap tidak valid.");if(isNaN(d)||d<0)return alert("Ukuran margin tidak valid.");o();const h=Array(i).fill(c),a=document.createElement("iframe");a.style.display="none",document.body.appendChild(a);const b=h.map((f,y)=>`
            <div class="label">
                <svg class="barcode" id="bc-${y}" data-barcode="${f.barcode}"></svg>
            </div>
        `).join(""),x=`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Cetak Barcode Produk</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"><\/script>
                <style>
                    @page { size: A4; margin: ${d}mm; }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; background: #fff; }

                    .grid { display: flex; flex-wrap: wrap; gap: ${l}mm; }
                    .label {
                        padding: 2mm;
                        text-align: center;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .barcode {
                        width: ${r}cm !important;
                        height: ${n}cm !important;
                    }
                </style>
            </head>
            <body>
                <div class="grid" style="padding: 4mm;">
                    ${b}
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
        `;a.srcdoc=x,a.onload=()=>{a.contentWindow.onafterprint=()=>{document.body.removeChild(a)}}};return e.jsxs(j,{title:"Pengaturan Cetak",isOpen:p,onClose:o,className:"max-w-sm",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Jumlah Copy"}),e.jsx(m,{type:"number",name:"qty",value:t.qty,onChange:s,className:" w-full",min:"1"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Lebar (cm)"}),e.jsx(m,{type:"number",name:"widthCm",value:t.widthCm,onChange:s,className:" w-full",step:"0.1"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Tinggi (cm)"}),e.jsx(m,{type:"number",name:"heightCm",value:t.heightCm,onChange:s,className:" w-full",step:"0.1"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Gap (mm)"}),e.jsx(m,{type:"number",name:"gapMm",value:t.gapMm,onChange:s,className:" w-full",step:"0.5",min:"0"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-slate-700 mb-1",children:"Margin Halaman (mm)"}),e.jsx(m,{type:"number",name:"marginMm",value:t.marginMm,onChange:s,className:" w-full",step:"1",min:"0"})]})]})]}),e.jsxs("div",{className:"mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100",children:[e.jsx("button",{type:"button",onClick:o,className:"px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors",children:"Batal"}),e.jsx(N,{icon:e.jsx(C,{className:"size-4"}),type:"button",onClick:g,children:"Lanjut Cetak"})]})]})}export{T as default};
