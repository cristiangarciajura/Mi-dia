#!/usr/bin/env python3
"""Build sports-data.json for Mi Día. Uses ESPN JSON and official FCF page."""
import json, re, urllib.request, datetime, html
from html.parser import HTMLParser
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
NOW=datetime.datetime.now(datetime.timezone.utc)
END=NOW+datetime.timedelta(days=370)
DATE_FROM=NOW.strftime('%Y%m%d'); DATE_TO=END.strftime('%Y%m%d')
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; MiDiaCalendar/1.0)','Accept':'application/json,text/html,*/*'}

def get(url):
    req=urllib.request.Request(url,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=25) as r: return r.read()

def espn_events(league):
    url=f'https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/scoreboard?dates={DATE_FROM}-{DATE_TO}&limit=1000&region=es&lang=es'
    data=json.loads(get(url).decode('utf-8','replace'))
    return data.get('events',[])

def team_fixture(event,key):
    comps=(event.get('competitions') or [{}])[0]
    teams=comps.get('competitors') or []
    home=next((x for x in teams if x.get('homeAway')=='home'),teams[0] if teams else {})
    away=next((x for x in teams if x.get('homeAway')=='away'),teams[1] if len(teams)>1 else {})
    hn=(home.get('team') or {}).get('displayName') or (home.get('team') or {}).get('name') or ''
    an=(away.get('team') or {}).get('displayName') or (away.get('team') or {}).get('name') or ''
    names=(hn+' '+an+' '+event.get('name','')).lower()
    if key=='madrid' and 'real madrid' not in names: return None
    if key=='espanyol' and 'espanyol' not in names: return None
    date=event.get('date')
    if not date: return None
    try: dt=datetime.datetime.fromisoformat(date.replace('Z','+00:00'))
    except ValueError: return None
    if dt < NOW-datetime.timedelta(hours=3): return None
    return {'date':date,'home':hn,'away':an,'competition':comps.get('name') or (event.get('season') or {}).get('name') or 'Fútbol'}

def fetch_club(key,leagues):
    events=[]; errors=[]
    for league in leagues:
        try: events.extend(espn_events(league))
        except Exception as exc: errors.append(f'{league}: {exc}')
    unique={str(e.get('id') or (e.get('date'),e.get('name'))):e for e in events}
    fixtures=[]
    for event in unique.values():
        f=team_fixture(event,key)
        if f: fixtures.append(f)
    fixtures.sort(key=lambda x:x['date'])
    return {'fixtures':fixtures[:3], 'message':'; '.join(errors) if errors else ('Calendario consultado; sin próximos partidos publicados.' if not fixtures else '')}

class TableParser(HTMLParser):
    def __init__(self): super().__init__(); self.rows=[]; self.row=None; self.cell=None; self.text=[]
    def handle_starttag(self,tag,attrs):
        if tag=='tr': self.row=[]
        elif tag in ('td','th') and self.row is not None: self.cell=[]
    def handle_data(self,data):
        if self.cell is not None: self.cell.append(data)
    def handle_endtag(self,tag):
        if tag in ('td','th') and self.cell is not None and self.row is not None:
            self.row.append(' '.join(' '.join(self.cell).split())); self.cell=None
        elif tag=='tr' and self.row is not None:
            if self.row: self.rows.append(self.row)
            self.row=None

TEAM_RE=re.compile(r'(?:P[ªa]\.?\s*Barc\.?\s*Sant Vicen[cç] Horts|Penya Barcelonista Sant Vicen[cç](?: dels)? Horts)',re.I)
DATE_RE=re.compile(r'(\d{1,2})[./-](\d{1,2})[./-](20\d{2})')
TIME_RE=re.compile(r'\b([01]?\d|2[0-3]):([0-5]\d)\b')
def fetch_fcf():
    url='https://www.fcf.cat/ca/competicio?temporadaId=22&disciplinaId=19308233&competicioId=58780268&grupId=60210831&jornada=5'
    try:
        raw=get(url).decode('utf-8','replace')
        parser=TableParser(); parser.feed(raw)
        fixtures=[]; standings=[]
        for row in parser.rows:
            line=' | '.join(row)
            if TEAM_RE.search(line):
                dm=DATE_RE.search(line)
                if dm:
                    day,month,year=map(int,dm.groups()); tm=TIME_RE.search(line)
                    hour,minute=(map(int,tm.groups()) if tm else (20,0))
                    try: dt=datetime.datetime(year,month,day,hour,minute,tzinfo=datetime.timezone(datetime.timedelta(hours=1)))
                    except ValueError: continue
                    if dt.astimezone(datetime.timezone.utc)>=NOW-datetime.timedelta(hours=3):
                        # Keep the full source row; avoid guessing opponent/home-away parsing.
                        fixtures.append({'date':dt.isoformat(),'display':' | '.join(row),'competition':'FCF · Cadete S15 · Grup 14'})
            # Do not infer a full table from a partial row; standings remain empty unless a future parser validates the whole group.
        fixtures.sort(key=lambda x:x['date'])
        return {'fixtures':fixtures[:3],'standings':standings,'status':'Fuente oficial FCF consultada; datos visibles extraídos de la página.' if fixtures or standings else 'La FCF respondió, pero su página no publicó filas legibles (puede cargar datos dinámicamente).'}
    except Exception as exc:
        return {'fixtures':[],'standings':[],'status':f'No se pudo consultar la FCF: {exc}'}

def main():
    data={'updatedAt':NOW.isoformat(),'teams':{},'fcf':{}}
    data['teams']['madrid']=fetch_club('madrid',['esp.1','uefa.champions'])
    data['teams']['espanyol']=fetch_club('espanyol',['esp.1'])
    data['fcf']=fetch_fcf()
    (ROOT/'sports-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:len(v.get('fixtures',[])) for k,v in data['teams'].items()},ensure_ascii=False))
    print('FCF:',data['fcf']['status'])
if __name__=='__main__': main()
