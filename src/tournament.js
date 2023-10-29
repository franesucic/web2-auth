import React, {useEffect} from 'react';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {firestore} from "./firebase"
import {getDocs, collection, setDoc, doc} from "@firebase/firestore"
import { useNavigate, useLocation } from 'react-router-dom';

function Tournament() {

    const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();

    const ref = collection(firestore, "natjecanja");
    const [currTour, setCurrTour] = useState({});
    const [firstTeam, setFirstTeam] = useState("");
    const [secondTeam, setSecondTeam] = useState("");
    const [firstPoints, setFirstPoints] = useState();
    const [secondPoints, setSecondPoints] = useState();
    const [show, setShow] = useState(false);
    const [table, setTable] = useState([]);
    const [url, setUrl] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    let points = [-1,-1,-1,-1,-1,-1,-1,-1];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(ref);
                const documents = querySnapshot.docs.map((doc) => ({...doc.data(), id:doc.id }));
                for (let i = 0; i < documents.length; ++i) {
                    //if (documents[i].kreator === user.email) {
                        //if (documents[i].id === localStorage.getItem(1)) {
                            if (documents[i].id === id) {
                        let obj = {
                            id: documents[i].id,
                            naziv: documents[i].naziv,
                            kreator: documents[i].kreator,
                            pobjeda: documents[i].pobjeda,
                            remi: documents[i].remi,
                            poraz: documents[i].poraz,
                            igre: documents[i].igre,
                            sudionici: documents[i].sudionici
                        }
                        setCurrTour(obj);
                        setUrl("https://web2-auth.vercel.app/tour&");
                    }
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    },[]);

    const handleFirstTeamChange = (e) => {
        setFirstTeam(e.target.value);
    }

    const handleSecondTeamChange = (e) => {
        setSecondTeam(e.target.value);
    }

    const handleFirstPointsChange = (e) => {
        if (!isNaN(e.target.value)) setFirstPoints(e.target.value);
    }

    const handleSecondPointsChange = (e) => {
        if (!isNaN(e.target.value)) setSecondPoints(e.target.value);
    }

    const handleLogout = async (e) => {
        try {
          await logout(); 
          navigate("/");
        } catch (error) {
            console.log("Something went wrong.");
        }
      };

    const handleShowTable = (e) => {
        
        for (let i = 0; i < currTour.sudionici.length; ++i) {
            for (let j = 0; j < currTour.igre.length; ++j) {
                if (currTour.igre[j].split("-").length > 3) {
                    if (currTour.igre[j].split("-")[1] === currTour.sudionici[i]) {
                        if (currTour.igre[j].split("-")[3] > currTour.igre[j].split("-")[4]) {
                            points[i] += parseFloat(currTour.pobjeda);
                        } else if (currTour.igre[j].split("-")[3] === currTour.igre[j].split("-")[4]) {
                            points[i] += parseFloat(currTour.remi);
                        } else if (currTour.igre[j].split("-")[3] < currTour.igre[j].split("-")[4]) {
                            points[i] += parseFloat(currTour.poraz);
                        }
                    } else if (currTour.igre[j].split("-")[2] === currTour.sudionici[i]) {
                        if (currTour.igre[j].split("-")[4] > currTour.igre[j].split("-")[3]) {
                            points[i] += parseFloat(currTour.pobjeda);
                        } else if (currTour.igre[j].split("-")[4] === currTour.igre[j].split("-")[3]) {
                            points[i] += parseFloat(currTour.remi);
                        } else if (currTour.igre[j].split("-")[4] < currTour.igre[j].split("-")[3]) {
                            points[i] += parseFloat(currTour.poraz);
                        }
                    }
                }
            }
        }
        for (let i = 0; i < currTour.sudionici.length; ++i) {
            points[i] += 1;
        }
        while (points.length > currTour.sudionici.length) points.pop();
        for (let i = 0; i < points.length; ++i) {
            points[i] = points[i] + " " + currTour.sudionici[i];
        }
        points.sort((a, b) => {
        const brojA = parseFloat(a.match(/^\d+/)[0]);
        const brojB = parseFloat(b.match(/^\d+/)[0]);
        return brojB - brojA;
        });
        setTable(points);
        setShow(!show);
    }

    const handleResultInput = async (e) => {
        let obj = [];

        const firstPromise = new Promise((resolve, reject) => {
        for (let i = 0; i < currTour.igre.length; ++i) {
            obj.push(currTour.igre[i]);
            if ((currTour.igre[i].split("-")[1].trim() === firstTeam) && (currTour.igre[i].split("-")[2].trim() === secondTeam)) {
                let newString = "";
                if (currTour.igre[i].split("-").length > 3) {
                    newString = currTour.igre[i].split("-")[0].trim() + "-" + currTour.igre[i].split("-")[1].trim() + "-" + currTour.igre[i].split("-")[2].trim() + "-" + firstPoints + "-" + secondPoints;
                } else {
                    newString = currTour.igre[i] + "-" + firstPoints + "-" + secondPoints;
                }
                obj.pop();
                obj.push(newString);
            } 
        }
        resolve();
        });
        
        const secondPromise = new Promise((resolve, reject) => {
            if (isNaN(firstPoints) || isNaN(secondPoints)) {
                alert("Unesite brojke u polje za rezultat");
                return;
            } else {
                let nasao1 = false;
                let nasao2 = false;
                for (let i = 0; i < currTour.sudionici.length; ++i) {
                    if (firstTeam === currTour.sudionici[i]) nasao1 = true;
                    if (secondTeam === currTour.sudionici[i]) nasao2 = true;
                }
                if (nasao1 && nasao2) {
                    updateDocument(currTour.id, {igre: obj}).then(() => window.location.reload());
                    resolve();
                } else {
                    alert("Utakmica nije pronađena, provjerite nazive momčadi.");
                    return
                }
                
            }
        });

        try {
            await Promise.all([firstPromise, secondPromise]);
        } catch(e) {
            console.log(e);
        }
        
    } 

    const updateDocument = async (documentId, newData) => {
        const docRef = doc(firestore, "natjecanja", documentId);
        try {
          await setDoc(docRef, newData, { merge: true });
          console.log("Dokument ažuriran uspješno.");
        } catch (error) {
          console.error("Greška prilikom ažuriranja dokumenta:", error);
        }
      };

    return(
    <>
        <div className='table-title'>
            <div>REZULTATI</div>
            <div>{currTour.naziv}</div>
        </div>
        { isAuthenticated ? <div id='logout-div'>
            <button onClick={handleLogout}>Odjava</button>
            <div className='link-div'><span><b>Poveznica:</b></span> https://web2-auth.vercel.app/tour/?id={id}</div>
        </div> : ""}
        <div className='container'>
        <div className='table-div'>
            <table>
                {currTour.naziv ?<> <thead>
                    <tr><td id="round">Kolo</td><td>Prva momčad</td><td>Druga Momčad</td><td>Rezultat</td></tr>
                </thead>
                <tr>
                    <td id="round">{currTour.igre[0].split("-")[0]}.</td><td>{currTour.igre[0].split("-")[1]}</td><td>{currTour.igre[0].split("-")[2]}</td><td>{currTour.igre[0].split("-")[3]} : {currTour.igre[0].split("-")[4]}</td>
                </tr>
                <tr>
                    <td id="round">{currTour.igre[1].split("-")[0]}.</td><td>{currTour.igre[1].split("-")[1]}</td><td>{currTour.igre[1].split("-")[2]}</td><td>{currTour.igre[1].split("-")[3]} : {currTour.igre[1].split("-")[4]}</td>
                </tr>
                <tr>
                    <td id="round">{currTour.igre[2].split("-")[0]}.</td><td>{currTour.igre[2].split("-")[1]}</td><td>{currTour.igre[2].split("-")[2]}</td><td>{currTour.igre[2].split("-")[3]} : {currTour.igre[2].split("-")[4]}</td>
                </tr>
                <tr>
                    <td id="round">{currTour.igre[3].split("-")[0]}.</td><td>{currTour.igre[3].split("-")[1]}</td><td>{currTour.igre[3].split("-")[2]}</td><td>{currTour.igre[3].split("-")[3]} : {currTour.igre[3].split("-")[4]}</td>
                </tr>
                <tr>
                    <td id="round">{currTour.igre[4].split("-")[0]}.</td><td>{currTour.igre[4].split("-")[1]}</td><td>{currTour.igre[4].split("-")[2]}</td><td>{currTour.igre[4].split("-")[3]} : {currTour.igre[4].split("-")[4]}</td>
                </tr>
                <tr>
                    <td id="round">{currTour.igre[5].split("-")[0]}.</td><td>{currTour.igre[5].split("-")[1]}</td><td>{currTour.igre[5].split("-")[2]}</td><td>{currTour.igre[5].split("-")[3]} : {currTour.igre[5].split("-")[4]}</td>
                </tr> </>: ""}
                {
                    currTour.naziv && currTour.sudionici.length > 4 ?
                        <>
                            <tr>
                                <td id="round">{currTour.igre[6].split("-")[0]}.</td><td>{currTour.igre[6].split("-")[1]}</td><td>{currTour.igre[6].split("-")[2]}</td><td>{currTour.igre[6].split("-")[3]} : {currTour.igre[6].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[7].split("-")[0]}.</td><td>{currTour.igre[7].split("-")[1]}</td><td>{currTour.igre[7].split("-")[2]}</td><td>{currTour.igre[7].split("-")[3]} : {currTour.igre[7].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[8].split("-")[0]}.</td><td>{currTour.igre[8].split("-")[1]}</td><td>{currTour.igre[8].split("-")[2]}</td><td>{currTour.igre[8].split("-")[3]} : {currTour.igre[8].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[9].split("-")[0]}.</td><td>{currTour.igre[9].split("-")[1]}</td><td>{currTour.igre[9].split("-")[2]}</td><td>{currTour.igre[9].split("-")[3]} : {currTour.igre[9].split("-")[4]}</td>
                            </tr>
                        </>
                    : ""
                }
                {
                    currTour.naziv && currTour.sudionici.length > 5 ?
                        <>
                            <tr>
                                <td id="round">{currTour.igre[10].split("-")[0]}.</td><td>{currTour.igre[10].split("-")[1]}</td><td>{currTour.igre[10].split("-")[2]}</td><td>{currTour.igre[10].split("-")[3]} : {currTour.igre[10].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[11].split("-")[0]}.</td><td>{currTour.igre[11].split("-")[1]}</td><td>{currTour.igre[11].split("-")[2]}</td><td>{currTour.igre[11].split("-")[3]} : {currTour.igre[11].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[12].split("-")[0]}.</td><td>{currTour.igre[12].split("-")[1]}</td><td>{currTour.igre[12].split("-")[2]}</td><td>{currTour.igre[12].split("-")[3]} : {currTour.igre[12].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[13].split("-")[0]}.</td><td>{currTour.igre[13].split("-")[1]}</td><td>{currTour.igre[13].split("-")[2]}</td><td>{currTour.igre[13].split("-")[3]} : {currTour.igre[13].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[14].split("-")[0]}.</td><td>{currTour.igre[14].split("-")[1]}</td><td>{currTour.igre[14].split("-")[2]}</td><td>{currTour.igre[14].split("-")[3]} : {currTour.igre[14].split("-")[4]}</td>
                            </tr>
                        </>
                    : ""
                }
                {
                    currTour.naziv && currTour.sudionici.length > 6 ?
                        <>
                            <tr>
                                <td id="round">{currTour.igre[15].split("-")[0]}.</td><td>{currTour.igre[15].split("-")[1]}</td><td>{currTour.igre[15].split("-")[2]}</td><td>{currTour.igre[15].split("-")[3]} : {currTour.igre[15].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[16].split("-")[0]}.</td><td>{currTour.igre[16].split("-")[1]}</td><td>{currTour.igre[16].split("-")[2]}</td><td>{currTour.igre[16].split("-")[3]} : {currTour.igre[16].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[17].split("-")[0]}.</td><td>{currTour.igre[17].split("-")[1]}</td><td>{currTour.igre[17].split("-")[2]}</td><td>{currTour.igre[17].split("-")[3]} : {currTour.igre[17].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[18].split("-")[0]}.</td><td>{currTour.igre[18].split("-")[1]}</td><td>{currTour.igre[18].split("-")[2]}</td><td>{currTour.igre[18].split("-")[3]} : {currTour.igre[18].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[19].split("-")[0]}.</td><td>{currTour.igre[19].split("-")[1]}</td><td>{currTour.igre[19].split("-")[2]}</td><td>{currTour.igre[19].split("-")[3]} : {currTour.igre[19].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[20].split("-")[0]}.</td><td>{currTour.igre[20].split("-")[1]}</td><td>{currTour.igre[20].split("-")[2]}</td><td>{currTour.igre[20].split("-")[3]} : {currTour.igre[20].split("-")[4]}</td>
                            </tr>
                        </>
                    : ""
                }
                {
                    currTour.naziv && currTour.sudionici.length > 7 ?
                        <>
                            <tr>
                                <td id="round">{currTour.igre[21].split("-")[0]}.</td><td>{currTour.igre[21].split("-")[1]}</td><td>{currTour.igre[21].split("-")[2]}</td><td>{currTour.igre[21].split("-")[3]} : {currTour.igre[21].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[22].split("-")[0]}.</td><td>{currTour.igre[22].split("-")[1]}</td><td>{currTour.igre[22].split("-")[2]}</td><td>{currTour.igre[22].split("-")[3]} : {currTour.igre[22].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[23].split("-")[0]}.</td><td>{currTour.igre[23].split("-")[1]}</td><td>{currTour.igre[23].split("-")[2]}</td><td>{currTour.igre[23].split("-")[3]} : {currTour.igre[23].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[24].split("-")[0]}.</td><td>{currTour.igre[24].split("-")[1]}</td><td>{currTour.igre[24].split("-")[2]}</td><td>{currTour.igre[24].split("-")[3]} : {currTour.igre[24].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[25].split("-")[0]}.</td><td>{currTour.igre[25].split("-")[1]}</td><td>{currTour.igre[25].split("-")[2]}</td><td>{currTour.igre[25].split("-")[3]} : {currTour.igre[25].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[26].split("-")[0]}.</td><td>{currTour.igre[26].split("-")[1]}</td><td>{currTour.igre[26].split("-")[2]}</td><td>{currTour.igre[26].split("-")[3]} : {currTour.igre[26].split("-")[4]}</td>
                            </tr>
                            <tr>
                                <td id="round">{currTour.igre[27].split("-")[0]}.</td><td>{currTour.igre[27].split("-")[1]}</td><td>{currTour.igre[27].split("-")[2]}</td><td>{currTour.igre[27].split("-")[3]} : {currTour.igre[27].split("-")[4]}</td>
                            </tr>
                        </>
                    : ""
                }
            </table>
        </div>
        { user.email === currTour.kreator ? <div>
            <div className='result-input-div'>
                <div>UNOS REZULTATA UTAKMICE:</div>
                <label>Prva momčad </label><input type='text' onChange={handleFirstTeamChange}></input>
                <label>Druga momčad </label><input type='text' onChange={handleSecondTeamChange}></input>
                <label>Rezultat</label><div id="res-div"><input type='text' className='num-input' onChange={handleFirstPointsChange}></input><input type='text' className='num-input' onChange={handleSecondPointsChange}></input></div>
                <button onClick={handleResultInput}>Unesi</button>
            </div>
            
             </div> : "" }
        </div>
        <div id="title"><button id="show-table" onClick={handleShowTable}>{show ? "Sakrij poredak" : "Prikaži poredak"}</button></div>
        {show ? <>
        <div id="title">POREDAK NA TABLICI</div>
        <div className='container'>
            <table>
                <thead>
                    <tr>
                        <td>MJESTO</td><td>MOMČAD</td><td>BODOVI</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1.</td><td>{table[0].split(" ")[1]}</td><td>{table[0].split(" ")[0]}</td>
                    </tr>
                    <tr>
                        <td>2.</td><td>{table[1].split(" ")[1]}</td><td>{table[1].split(" ")[0]}</td>
                    </tr>
                    <tr>
                        <td>3.</td><td>{table[2].split(" ")[1]}</td><td>{table[2].split(" ")[0]}</td>
                    </tr>
                    <tr>
                        <td>4.</td><td>{table[3].split(" ")[1]}</td><td>{table[3].split(" ")[0]}</td>
                    </tr>
                    {currTour.sudionici.length > 4 ?
                    <tr>
                        <td>5.</td><td>{table[4].split(" ")[1]}</td><td>{table[4].split(" ")[0]}</td>
                    </tr>
                : ""}
                {currTour.sudionici.length > 5 ?
                    <tr>
                        <td>6.</td><td>{table[5].split(" ")[1]}</td><td>{table[5].split(" ")[0]}</td>
                    </tr>
                : ""}
                {currTour.sudionici.length > 6 ?
                    <tr>
                        <td>7.</td><td>{table[6].split(" ")[1]}</td><td>{table[6].split(" ")[0]}</td>
                    </tr>
                : ""}
                {currTour.sudionici.length > 7 ?
                    <tr>
                        <td>8.</td><td>{table[7].split(" ")[1]}</td><td>{table[7].split(" ")[0]}</td>
                    </tr>
                : ""}
                </tbody>
            </table>
        </div> </>: ""}
    </>    
    )

}

export default Tournament;