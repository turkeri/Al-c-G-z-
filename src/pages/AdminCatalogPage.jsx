import{useEffect,useState}from'react';import{Link,useParams}from'react-router-dom';import PageContainer from'../components/Layout/PageContainer';import AdminCatalogEntityForm from'../components/AdminCatalogEntityForm';import AdminCatalogReviewPanel from'../components/AdminCatalogReviewPanel';import AdminCatalogEntityListPanel from'../components/AdminCatalogEntityListPanel';import{getAdminMe}from'../services/adminService';import{createRevision,getRevisionSummary,listRevisions,publishRevision,rollbackCatalog,validateRevision}from'../services/adminCatalogService';
const sections={markalar:'brands',modeller:'models',nesiller:'generations',motorlar:'engines',sanzimanlar:'transmissions',paketler:'packages',donanimlar:'equipment',varyantlar:'vehicleVariants','sorun-arketipleri':'problemArchetypes',sorunlar:'problemApplicability',bakim:'maintenanceItems','bakim-kapsamlari':'maintenanceApplicability',degerler:'referenceValues',faktorler:'valuationFactors'};
export default function AdminCatalogPage(){
  const{revisionId,section,entityId}=useParams(),entity=sections[section]
  const[permissions,setPermissions]=useState([]),[data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false)
  const can=p=>permissions.includes(p)
  async function load(){
    setError('')
    try{
      setPermissions((await getAdminMe()).permissions)
      if(!revisionId)setData(await listRevisions())
      else setData(await getRevisionSummary(revisionId))
    }catch(e){setError(e.message)}
  }
  useEffect(()=>{load()},[revisionId,section])
  async function action(fn){
    if(busy)return
    setBusy(true)
    try{await fn();await load()}catch(e){setError(e.message)}finally{setBusy(false)}
  }
  const readOnly=Boolean(data?.revision?.status&&data.revision.status!=='draft')
  return <PageContainer><section className="auth-card">
    <p className="eyebrow">YÖNETİM · KATALOG</p>
    <h1>{entity?`${section} yönetimi`:revisionId?'Katalog revision':'Katalog revisionları'}</h1>
    <p>
      <Link to="/admin">Yönetime dön</Link>
      {revisionId&&<> · <Link to={`/admin/katalog/revizyonlar/${encodeURIComponent(revisionId)}`}>Özet</Link> · <Link to={`/admin/katalog/revizyonlar/${encodeURIComponent(revisionId)}/inceleme`}>İnceleme</Link></>}
    </p>
    {error&&<p className="auth-error">{error}</p>}

    {entityId&&<AdminCatalogEntityForm revisionId={revisionId} entity={entity} id={entityId==='yeni'?null:entityId} readOnly={!can('catalog:write')||readOnly}/>}

    {!entityId&&<>
      {section==='inceleme'&&<AdminCatalogReviewPanel revisionId={revisionId} permissions={permissions} readOnly={readOnly}/>}

      {section!=='inceleme'&&entity&&<AdminCatalogEntityListPanel revisionId={revisionId} entity={entity} section={section} permissions={permissions} readOnly={readOnly}/>}

      {section!=='inceleme'&&!entity&&<>
        {!revisionId&&can('catalog:write')&&<p>
          <button disabled={busy} className="btn btn-primary" onClick={()=>action(()=>createRevision({label:'Yeni boş taslak'}))}>Yeni boş taslak</button>{' '}
          <button disabled={busy} className="btn btn-secondary" onClick={()=>action(()=>createRevision({label:'Published kopyası',cloneFromPublished:true}))}>Published’dan taslak oluştur</button>
        </p>}
        {revisionId&&<>
          <p>
            {can('catalog:validate')&&<button className="btn btn-secondary" onClick={()=>action(()=>validateRevision(revisionId))}>Doğrula</button>}{' '}
            {can('catalog:publish')&&<button className="btn btn-primary" onClick={()=>confirm('Yayınlansın mı?')&&action(()=>publishRevision(revisionId))}>Yayınla</button>}{' '}
            {can('catalog:rollback')&&<button className="btn btn-secondary" onClick={()=>{const reason=prompt('Rollback gerekçesi');if(reason)action(()=>rollbackCatalog(revisionId,reason))}}>Rollback</button>}
          </p>
          <nav className="admin-catalog-nav">{Object.keys(sections).map(key=><Link key={key} to={`/admin/katalog/revizyonlar/${encodeURIComponent(revisionId)}/${key}`}>{key}</Link>)}</nav>
        </>}

        <div className="saved-list">{(data?.items||[]).map(item=>
          <div className="saved-item" key={item.id}>
            <span className="saved-item-body"><b>{item.display_name||item.title||item.label||item.id}</b><span>{item.status||item.source_confidence||item.confidence||''}</span></span>
            {!revisionId&&<Link to={`/admin/katalog/revizyonlar/${encodeURIComponent(item.id)}`}>Aç</Link>}
          </div>
        )}</div>
        {data?.items?.length===0&&<p>Kayıt bulunamadı.</p>}
        {data&&!data.items&&<pre className="catalog-review">{JSON.stringify(data,null,2)}</pre>}
      </>}
    </>}
  </section></PageContainer>
}
