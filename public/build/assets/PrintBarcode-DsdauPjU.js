import{r as C,j as a}from"./app-Dm587jcO.js";import{P as N}from"./Popup-Dq8vX0YT.js";import{P as k}from"./PrimaryButton-Ck5DXGAY.js";import{T as w}from"./TextInput-ClALz1US.js";import{P as B}from"./printer-kEVlCZ0z.js";import"./transition-C3BFPst_.js";import"./x-fFKsQlqq.js";import"./createLucideIcon-DhtVThR8.js";function i({label:c,name:p,value:r,onChange:e,step:g="1",min:t="0"}){return a.jsxs("div",{children:[a.jsx("label",{className:"block text-xs font-medium text-slate-600 mb-1",children:c}),a.jsx(w,{type:"number",name:p,value:r,onChange:e,className:"w-full",step:g,min:t})]})}function E({variant:c,isOpen:p,onClose:r}){const[e,g]=C.useState({qty:1,widthCm:4,heightCm:1.5,gapXMm:4,gapYMm:4,marginTopMm:8,marginRightMm:8,marginBottomMm:8,marginLeftMm:8}),t=n=>{const{name:m,value:l}=n.target;g(o=>({...o,[m]:l}))},v=()=>{const n=parseInt(e.qty,10),m=parseFloat(e.widthCm),l=parseFloat(e.heightCm),o=parseFloat(e.gapXMm),h=parseFloat(e.gapYMm),u=parseFloat(e.marginTopMm),x=parseFloat(e.marginRightMm),b=parseFloat(e.marginBottomMm),f=parseFloat(e.marginLeftMm);if(isNaN(n)||n<=0)return alert("Jumlah copy tidak valid.");if(isNaN(m)||m<=0)return alert("Lebar tidak valid.");if(isNaN(l)||l<=0)return alert("Tinggi tidak valid.");if(isNaN(o)||o<0)return alert("Gap X tidak valid.");if(isNaN(h)||h<0)return alert("Gap Y tidak valid.");if([u,x,b,f].some(d=>isNaN(d)||d<0))return alert("Margin tidak valid.");r();const j=Array(n).fill(c).map((d,y)=>`
            <div class="label">
                <svg class="barcode" id="bc-${y}" data-barcode="${d.barcode}"></svg>
            </div>
        `).join(""),M=`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Cetak Barcode Produk</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"><\/script>
                <style>
                    @page { size: A4; margin: 0; }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        font-family: Arial, sans-serif;
                        background: #fff;
                        padding: ${u}mm ${x}mm ${b}mm ${f}mm;
                    }

                    .grid {
                        display: flex;
                        flex-wrap: wrap;
                        column-gap: ${o}mm;
                        row-gap: ${h}mm;
                    }
                    .label {
                        text-align: center;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .barcode {
                        width: ${m}cm !important;
                        height: ${l}cm !important;
                    }
                </style>
            </head>
            <body>
                <div class="grid">
                    ${j}
                </div>
                <script>
                    document.querySelectorAll('.barcode').forEach(function(svg) {
                        try {
                            JsBarcode(svg, svg.dataset.barcode, {
                                format:       'EAN13',
                                width:        2,
                                height:       50,
                                displayValue: true,
                                margin:       2,
                            });
                        } catch(e) {
                            svg.outerHTML = '<p style="color:red;font-size:8pt;">Invalid</p>';
                        }
                    });
                    setTimeout(function() { window.print(); }, 500);
                <\/script>
            </body>
            </html>
        `,s=document.createElement("iframe");s.style.display="none",document.body.appendChild(s),s.srcdoc=M,s.onload=()=>{s.contentWindow.onafterprint=()=>document.body.removeChild(s)}};return a.jsxs(N,{title:"Pengaturan Cetak",isOpen:p,onClose:r,className:"max-w-sm",children:[a.jsxs("div",{className:"space-y-5",children:[a.jsx(i,{label:"Jumlah Copy",name:"qty",value:e.qty,onChange:t,min:"1"}),a.jsxs("div",{children:[a.jsx("p",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2",children:"Ukuran Label"}),a.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[a.jsx(i,{label:"Lebar (cm)",name:"widthCm",value:e.widthCm,onChange:t,step:"0.1",min:"0.1"}),a.jsx(i,{label:"Tinggi (cm)",name:"heightCm",value:e.heightCm,onChange:t,step:"0.1",min:"0.1"})]})]}),a.jsxs("div",{children:[a.jsx("p",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2",children:"Gap antar Label (mm)"}),a.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[a.jsx(i,{label:"Gap X (horizontal)",name:"gapXMm",value:e.gapXMm,onChange:t,step:"0.5"}),a.jsx(i,{label:"Gap Y (vertikal)",name:"gapYMm",value:e.gapYMm,onChange:t,step:"0.5"})]})]}),a.jsxs("div",{children:[a.jsx("p",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2",children:"Margin Halaman (mm)"}),a.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[a.jsx(i,{label:"Atas",name:"marginTopMm",value:e.marginTopMm,onChange:t}),a.jsx(i,{label:"Bawah",name:"marginBottomMm",value:e.marginBottomMm,onChange:t}),a.jsx(i,{label:"Kiri",name:"marginLeftMm",value:e.marginLeftMm,onChange:t}),a.jsx(i,{label:"Kanan",name:"marginRightMm",value:e.marginRightMm,onChange:t})]})]})]}),a.jsxs("div",{className:"mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100",children:[a.jsx("button",{type:"button",onClick:r,className:"px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors",children:"Batal"}),a.jsx(k,{icon:a.jsx(B,{className:"size-4"}),type:"button",onClick:v,children:"Lanjut Cetak"})]})]})}export{E as default};
