import { collection, getDocs, query, where } from 'firebase/firestore'
import Breadcrumb from '../../components/breadcrumb/Breadcrumb'
import Header from '../../components/header/Header'
import Kpi from '../../components/kpi/Kpi'
import Sales from '../../components/sales/Sales'
import { breadcrumbDashboard } from '../../data/breadcrumb'
import { headerNav } from '../../data/header'
import { kpi } from '../../data/kpi'
import { SalesType } from '../../models/Sales'

import './dashboard.scss'
import { useEffect, useState } from 'react'
import { db } from '../../firebase'
export default function Dashboard() {
    const [salesSold, setSalesSold] = useState(Array<SalesType>);
    const [salesNotSold, setSalesNotSold] = useState(Array<SalesType>);

    //Get Sales sold in database
    const getArticleSold = async () => {
        try{
            const q = query(collection(db, "article"), where("etat", "==", true));
            const querySnapshot = await getDocs(q);
            const newData = querySnapshot.docs.map(doc => {
                const dateA = new Date(doc.data().dateA.seconds * 1000);
                const dateV = new Date(doc.data().dateV.seconds * 1000);
                return {
                    idsales: doc.data().reference,
                    description: doc.data().description,
                    taille: doc.data().taille,
                    prixAchat: doc.data().prixA,
                    prixVente: doc.data().prixV,
                    benefice: doc.data().benefice,
                    dateA: dateA.toDateString(),
                    dateV: dateV.toDateString(),
                    etat: doc.data().etat
                }
            });
            setSalesSold(newData);
        }catch(error){
            console.log(error);
        }
    }

    //Get Sales not sold in database
    const getArticleNotSold = async () => {
        try{
            const q = query(collection(db, "article"), where("etat", "==", false));
            const querySnapshot = await getDocs(q);
            const newData = querySnapshot.docs.map(doc => {
                const dateA = new Date(doc.data().dateA.seconds * 1000);
                const dateV = new Date(doc.data().dateV.seconds * 1000);
                return {
                    idsales: doc.data().reference,
                    description: doc.data().description,
                    taille: doc.data().taille,
                    prixAchat: doc.data().prixA,
                    prixVente: doc.data().prixV,
                    benefice: doc.data().benefice,
                    dateA: dateA.toDateString(),
                    dateV: dateV.toDateString(),
                    etat: doc.data().etat
                }
            });
            setSalesNotSold(newData);
        }catch(error){
            console.log(error);
        }
    }

    //GetTotalArticle sold
    const salesSoldTotal = salesSold.reduce((a, b) => {
        return a + b.prixVente
    }, 0);

    //GetTotalBenefice on article sold
    const salesBenefice = salesSold.reduce((a, b) => {
        return a + (b?.benefice || 0)
    }, 0)
    
    //Update KPI depending on list database
    const updateKpi = kpi.map((item) => {
        if (item.title === 'Articles vendus') {
            return {
                ...item,
                value: salesSold.length
            }
        } else if (item.title === 'Articles non vendus') {
            return {
                ...item,
                value: salesNotSold.length
            }
        } else if (item.title === 'Bénéfices') {
            return {
                ...item,
                value: salesBenefice
            }
        } else if (item.title === 'Vente Totales') {
            return {
                ...item,
                value: salesSoldTotal
            }
        }
    })

    useEffect(() => {
        getArticleSold();
        getArticleNotSold();
        console.log(salesSold)
    }, [])
    return (
        <>
            <Header linkMenu={headerNav} userMail="hirimanana@yahoo.fr"/>
            <div className='main-page'>
                <div className="container">
                    <div className="main-page-top">
                        <Breadcrumb items={breadcrumbDashboard}/>
                    </div>
                    <div className="main-section listKpi">
                            {updateKpi.map((item, index) => <Kpi key={index} icon={item.icon} title={item.title} value={item.value} currency={item.currency} />)}
                    </div>
                    <div className='main-section detailKpi'>
                        <div className="detailKpi-item">
                            <h2 className="title-h2 detailKpi-title">Articles vendus</h2>
                            <Sales dataList={salesSold}/>
                        </div>
                        <div className="detailKpi-item">
                            <h2 className="title-h2 detailKpi-title">Articles non vendus</h2>
                            <Sales dataList={salesNotSold}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
        
    )
}