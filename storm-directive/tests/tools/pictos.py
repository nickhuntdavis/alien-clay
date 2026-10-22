import re, json, sys, xml.etree.ElementTree as ET
D=sys.argv[1]; OUT=sys.argv[2]
NS='{http://www.w3.org/2000/svg}'
root=ET.parse(D+'/grid.svg').getroot()
grid=[g for g in root.iter(NS+'g') if g.get('id')=='__picto_export'][0]
cells=[g for g in grid if g.tag==NS+'g' and (g.get('id') or '').startswith('Picto / ')]
num=re.compile(r'-?\d*\.?\d+(?:e-?\d+)?')
tok=re.compile(r'[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e-?\d+)?')
ARGS={'M':2,'L':2,'T':2,'H':1,'V':1,'C':6,'S':4,'Q':4,'A':7,'Z':0}
def fmt(v):
    v=round(v,1)
    if v==int(v): s=str(int(v))
    else: s=('%.1f'%v)
    if s.startswith('0.'): s=s[1:]
    elif s.startswith('-0.'): s='-'+s[2:]
    return s
def shift(d,ox,oy):
    t=tok.findall(d); out=[]; i=0; cmd=None
    while i<len(t):
        if re.match(r'[A-Za-z]',t[i]): cmd=t[i]; out.append(cmd); i+=1
        if cmd in 'Zz': continue
        n=ARGS[cmd.upper()]; vals=[float(x) for x in t[i:i+n]]; i+=n
        if cmd.isupper():
            C=cmd
            if C in 'MLTCSQ':
                vals=[v-(ox if k%2==0 else oy) for k,v in enumerate(vals)]
            elif C=='H': vals=[vals[0]-ox]
            elif C=='V': vals=[vals[0]-oy]
            elif C=='A': vals[5]-=ox; vals[6]-=oy
        out.append(vals)
        if cmd in 'Mm': cmd='L' if cmd=='M' else 'l'
    # serialise compactly
    s=''; prev=''
    for o in out:
        if isinstance(o,str): s+=o; prev=o; continue
        for v in o:
            f=fmt(v)
            if s and (s[-1].isdigit() or s[-1]=='.') and not f.startswith('-') and not (f.startswith('.') and '.' not in s[re.search(r'[\d.]*$',s).start():]):
                s+=' '
            elif s and s[-1]=='.' : s+=' '
            s+=f
    return s
def kinds(el):
    out=[]
    f=el.get('fill')
    if f and f!='none': out.append('G' if f.upper() in ('#F9FAF4','WHITE','#FFFFFF','#E4E5E0') else 'F')
    k=kind(el)
    if k and k[0] in 'ST': out.append(k)
    return out
def kind(el):
    f=el.get('fill'); st=el.get('stroke')
    if st and st!='none':
        code='T' if st.upper() in ('#F9FAF4','WHITE','#FFFFFF','#E4E5E0') else 'S'
        w=el.get('stroke-width','1'); code+=fmt(float(w))
        if el.get('stroke-linecap')!='round': code+=',b'
        if el.get('stroke-linejoin')!='round': code+=',m'
        da=el.get('stroke-dasharray')
        if da: code+=',d'+da.replace(' ','_')
        return code
    if f and f!='none':
        return 'G' if f.upper() in ('#F9FAF4','WHITE','#FFFFFF','#E4E5E0') else 'F'
    return None
def slug(name):
    n=name.replace('Picto / ','')
    parts=[re.sub(r'[^a-z0-9]+','-',p.strip().lower()).strip('-') for p in n.split('/')]
    return '/'.join(parts)
res={}; bad=[]
for idx,g in enumerate(cells):
    ox=(idx%20)*80; oy=(idx//20)*80
    segs=[]
    for el in g.iter():
        if el.tag==NS+'rect' and el.get('fill') and el.get('fill')!='none':
            x=float(el.get('x',0)); y=float(el.get('y',0)); w=float(el.get('width')); h=float(el.get('height'))
            d=f'M{x} {y}H{x+w}V{y+h}H{x}Z'
        elif el.tag==NS+'path': d=el.get('d')
        else: continue
        if el.get('transform'): bad.append((g.get('id'),'transform')); continue
        sd=shift(d,ox,oy)
        for k in kinds(el):
            if segs and segs[-1][0]==k and not el.get('fill-rule'): segs[-1][1]+=sd
            else: segs.append([k,sd])
    res[slug(g.get('id'))]='|'.join(k+' '+d for k,d in segs)
js=json.dumps(res,separators=(',',':'),ensure_ascii=False)
open(OUT,'w').write(js)
print(len(res),'pictos',len(js),'bytes; bad',bad[:5])
