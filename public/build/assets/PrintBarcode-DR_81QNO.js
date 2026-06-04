import{r as v,j as a}from"./app-RU9vQ0i5.js";import{P as N}from"./Popup-DLnx3eQa.js";import{P as w}from"./PrimaryButton-Cocn65Rn.js";import{T as k}from"./TextInput-BZhNicFY.js";import{P as T}from"./printer-DHK-nZ-C.js";import"./transition-CoVsT_ZT.js";import"./x-DNnGt95_.js";import"./createLucideIcon-Be8qowzL.js";function r({label:e,name:g,value:c,onChange:t,step:p="1",min:i="0"}){return a.jsxs("div",{children:[a.jsx("label",{className:"block text-xs font-medium text-slate-600 mb-1",children:e}),a.jsx(k,{type:"number",name:g,value:c,onChange:t,className:"w-full",step:p,min:i})]})}const m={qty:1,widthCm:4,heightCm:1.5,gapXMm:4,gapYMm:4,marginTopMm:8,marginRightMm:8,marginBottomMm:8,marginLeftMm:8};function B(e){return{qty:e.qty??m.qty,widthCm:e.width_cm??m.widthCm,heightCm:e.height_cm??m.heightCm,gapXMm:e.gap_x_mm??m.gapXMm,gapYMm:e.gap_y_mm??m.gapYMm,marginTopMm:e.margin_top_mm??m.marginTopMm,marginRightMm:e.margin_right_mm??m.marginRightMm,marginBottomMm:e.margin_bottom_mm??m.marginBottomMm,marginLeftMm:e.margin_left_mm??m.marginLeftMm}}function A({variant:e,isOpen:g,onClose:c}){const[t,p]=v.useState(m);v.useEffect(()=>{g&&axios.get(route("admin.barcode-print-config.show")).then(n=>p(B(n.data))).catch(()=>{})},[g]);const i=n=>{const{name:s,value:o}=n.target;p(l=>({...l,[s]:o}))},j=()=>{const n=parseInt(t.qty,10),s=parseFloat(t.widthCm),o=parseFloat(t.heightCm),l=parseFloat(t.gapXMm),h=parseFloat(t.gapYMm),x=parseFloat(t.marginTopMm),b=parseFloat(t.marginRightMm),f=parseFloat(t.marginBottomMm),M=parseFloat(t.marginLeftMm);if(isNaN(n)||n<=0)return alert("Jumlah copy tidak valid.");if(isNaN(s)||s<=0)return alert("Lebar tidak valid.");if(isNaN(o)||o<=0)return alert("Tinggi tidak valid.");if(isNaN(l)||l<0)return alert("Gap X tidak valid.");if(isNaN(h)||h<0)return alert("Gap Y tidak valid.");if([x,b,f,M].some(u=>isNaN(u)||u<0))return alert("Margin tidak valid.");axios.post(route("admin.barcode-print-config.update"),{qty:n,width_cm:s,height_cm:o,gap_x_mm:l,gap_y_mm:h,margin_top_mm:x,margin_right_mm:b,margin_bottom_mm:f,margin_left_mm:M}).catch(()=>{}),c();const y=Array(n).fill(e).map((u,_)=>`
            <div class="label">
                <svg class="barcode" id="bc-${_}" data-barcode="${u.barcode}"></svg>
            </div>
        `).join(""),C=`
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
                        padding: ${x}mm ${b}mm ${f}mm ${M}mm;
                    }

                    .grid {
                        display: flex;
                        flex-wrap: wrap;
                        column-gap: ${l}mm;
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
                        width: ${s}cm !important;
                        height: ${o}cm !important;
                    }
                </style>
            </head>
            <body>
                <div class="grid">
                    ${y}
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
        `,d=document.createElement("iframe");d.style.display="none",document.body.appendChild(d),d.srcdoc=C,d.onload=()=>{d.contentWindow.onafterprint=()=>document.body.removeChild(d)}};return a.jsxs(N,{title:"Pengaturan Cetak",isOpen:g,onClose:c,className:"max-w-sm",children:[a.jsxs("div",{className:"space-y-5",children:[a.jsx(r,{label:"Jumlah Copy",name:"qty",value:t.qty,onChange:i,min:"1"}),a.jsxs("div",{children:[a.jsx("p",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2",children:"Ukuran Label"}),a.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[a.jsx(r,{label:"Lebar (cm)",name:"widthCm",value:t.widthCm,onChange:i,step:"0.1",min:"0.1"}),a.jsx(r,{label:"Tinggi (cm)",name:"heightCm",value:t.heightCm,onChange:i,step:"0.1",min:"0.1"})]})]}),a.jsxs("div",{children:[a.jsx("p",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2",children:"Gap antar Label (mm)"}),a.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[a.jsx(r,{label:"Gap X (horizontal)",name:"gapXMm",value:t.gapXMm,onChange:i,step:"0.5"}),a.jsx(r,{label:"Gap Y (vertikal)",name:"gapYMm",value:t.gapYMm,onChange:i,step:"0.5"})]})]}),a.jsxs("div",{children:[a.jsx("p",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2",children:"Margin Halaman (mm)"}),a.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[a.jsx(r,{label:"Atas",name:"marginTopMm",value:t.marginTopMm,onChange:i}),a.jsx(r,{label:"Bawah",name:"marginBottomMm",value:t.marginBottomMm,onChange:i}),a.jsx(r,{label:"Kiri",name:"marginLeftMm",value:t.marginLeftMm,onChange:i}),a.jsx(r,{label:"Kanan",name:"marginRightMm",value:t.marginRightMm,onChange:i})]})]})]}),a.jsxs("div",{className:"mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100",children:[a.jsx("button",{type:"button",onClick:c,className:"px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors",children:"Batal"}),a.jsx(w,{icon:a.jsx(T,{className:"size-4"}),type:"button",onClick:j,children:"Lanjut Cetak"})]})]})}export{A as default};
