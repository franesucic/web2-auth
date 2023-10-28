import React, {useEffect} from 'react';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {firestore} from "../firebase"
import {getDocs, addDoc, collection} from "@firebase/firestore"
import { useNavigate, Link, useLocation } from 'react-router-dom';

function Body() {

    // STATES

    const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
    const [name, setName] = useState("");
    const [playerString, setPlayerString] = useState("");
    const [win, setWin] = useState();
    const [tie, setTie] = useState();
    const [loss, setLoss] = useState();
    const [nameError, setNameError] = useState(false);
    const [formatError, setFormatError] = useState(false);
    const [playersError, setPlayersError] = useState(false);
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [tournaments, setTournaments] = useState([]);

    const ref = collection(firestore, "natjecanja");
    const navigate = useNavigate();

      function generateRounds() {
        if (players.length === 4) {
            games.push("1-" + players[0]+"-"+players[3]);
            games.push("1-" + players[1]+"-"+players[2]);
            games.push("2-" + players[0]+"-"+players[1]);
            games.push("2-" + players[2]+"-"+players[3]);
            games.push("3-" + players[2]+"-"+players[0]);
            games.push("3-" + players[3]+"-"+players[1]);
        } else if (players.length === 5) {
            games.push("1-" + players[0]+"-"+players[1]);
            games.push("1-" + players[4]+"-"+players[3]);
            games.push("2-" + players[1]+"-"+players[2]);
            games.push("2-" + players[4]+"-"+players[0]);
            games.push("3-" + players[2]+"-"+players[0]);
            games.push("3-" + players[1]+"-"+players[3]);
            games.push("4-" + players[2]+"-"+players[3]);
            games.push("4-" + players[4]+"-"+players[1]);
            games.push("5-" + players[0]+"-"+players[3]);
            games.push("5-" + players[2]+"-"+players[4]);
        } else if (players.length === 6) {
            games.push("1-" + players[0]+"-"+players[5]);
            games.push("1-" + players[1]+"-"+players[4]);
            games.push("1-" + players[2]+"-"+players[3]);
            games.push("2-" + players[1]+"-"+players[5]);
            games.push("2-" + players[2]+"-"+players[0]);
            games.push("2-" + players[3]+"-"+players[4]);
            games.push("3-" + players[2]+"-"+players[5]);
            games.push("3-" + players[3]+"-"+players[1]);
            games.push("3-" + players[4]+"-"+players[0]);
            games.push("4-" + players[3]+"-"+players[5]);
            games.push("4-" + players[4]+"-"+players[2]);
            games.push("4-" + players[0]+"-"+players[1]);
            games.push("5-" + players[4]+"-"+players[5]);
            games.push("5-" + players[0]+"-"+players[3]);
            games.push("5-" + players[1]+"-"+players[2]);
        } else if (players.length === 7) {
            games.push("1-" + players[0]+"-"+players[1]);
            games.push("1-" + players[2]+"-"+players[3]);
            games.push("1-" + players[4]+"-"+players[5]);
            games.push("2-" + players[0]+"-"+players[2]);
            games.push("2-" + players[1]+"-"+players[3]);
            games.push("2-" + players[5]+"-"+players[6]);
            games.push("3-" + players[0]+"-"+players[3]);
            games.push("3-" + players[1]+"-"+players[4]);
            games.push("3-" + players[5]+"-"+players[6]);
            games.push("4-" + players[0]+"-"+players[4]);
            games.push("4-" + players[2]+"-"+players[5]);
            games.push("4-" + players[1]+"-"+players[6]);
            games.push("5-" + players[0]+"-"+players[5]);
            games.push("5-" + players[4]+"-"+players[6]);
            games.push("5-" + players[3]+"-"+players[1]);
            games.push("6-" + players[0]+"-"+players[6]);
            games.push("6-" + players[5]+"-"+players[1]);
            games.push("6-" + players[3]+"-"+players[2]);
            games.push("7-" + players[1]+"-"+players[2]);
            games.push("7-" + players[6]+"-"+players[3]);
            games.push("7-" + players[5]+"-"+players[4]);
        } else {
            console.log(players);
            games.push("1-" + players[0]+"-"+players[7]);
            games.push("1-" + players[1]+"-"+players[6]);
            games.push("1-" + players[2]+"-"+players[5]);
            games.push("1-" + players[3]+"-"+players[4]);
            games.push("2-" + players[1]+"-"+players[7]);
            games.push("2-" + players[2]+"-"+players[0]);
            games.push("2-" + players[3]+"-"+players[6]);
            games.push("2-" + players[4]+"-"+players[5]);
            games.push("3-" + players[2]+"-"+players[7]);
            games.push("3-" + players[3]+"-"+players[1]);
            games.push("3-" + players[4]+"-"+players[0]);
            games.push("3-" + players[5]+"-"+players[6]);
            games.push("4-" + players[3]+"-"+players[7]);
            games.push("4-" + players[4]+"-"+players[2]);
            games.push("4-" + players[5]+"-"+players[1]);
            games.push("4-" + players[6]+"-"+players[0]);
            games.push("5-" + players[4]+"-"+players[7]);
            games.push("5-" + players[5]+"-"+players[3]);
            games.push("5-" + players[6]+"-"+players[2]);
            games.push("5-" + players[0]+"-"+players[1]);
            games.push("6-" + players[5]+"-"+players[7]);
            games.push("6-" + players[6]+"-"+players[4]);
            games.push("6-" + players[0]+"-"+players[3]);
            games.push("6-" + players[1]+"-"+players[2]);
            games.push("7-" + players[6]+"-"+players[7]);
            games.push("7-" + players[0]+"-"+players[5]);
            games.push("7-" + players[1]+"-"+players[4]);
            games.push("7-" + players[2]+"-"+players[3]);
        }
      }

      useEffect(() => {
        const fetchData = async () => {
          try {
              const querySnapshot = await getDocs(ref);
              const documents = querySnapshot.docs.map((doc) => ({...doc.data(), id:doc.id }));
              setTournaments(documents)
          } catch (err) {
              console.log(err);
          }
      };
      fetchData();
      },[]);

    // HANDLER FUNCTIONS

    const handleUserInput = async (e) => {
        e.preventDefault();

        const nameValidationPromise = new Promise((resolve, reject) => {
            if (name.length < 3) {
                setNameError(true);
                reject(new Error('Invalid name'));
              } else {
                setNameError(false);
                resolve();
              }
        });
      
        const playersValidationPromise = new Promise((resolve, reject) => {
          if (players.length < 4 || players.length > 8) {
            setPlayersError(true);
            reject(new Error('Invalid number of players'));
          } else {
            setPlayersError(false);
            resolve();
          }
        });
      
        const formatValidationPromise = new Promise((resolve, reject) => {
          if (isNaN(win) || isNaN(tie) || isNaN(loss)) {
            setFormatError(true);
            reject(new Error('Invalid format'));
          } else {
            setFormatError(false);
            resolve();
          }
        });
      
        try {
          await Promise.all([nameValidationPromise, playersValidationPromise, formatValidationPromise]);
          generateRounds();
          let data = {
            kreator: user.email,
            naziv: name,
            sudionici: players,
            pobjeda: win,
            remi: tie,
            poraz: loss,
            igre: games
          }
          try {
            const docRef = await addDoc(ref, data);
            console.log(docRef.id)
            //localStorage.setItem(1, docRef.id);
          } catch (err) {
            console.log(err);
          }
          navigate("/tour"); 
        } catch (error) {
          console.error(error);
        }
      };

    const handleNameChange = (e) => {
        setName(e.target.value)
    }

    const handlePlayersChange = (e) => {
        setPlayerString(e.target.value + "\n");
        let p = playerString.split("\n");
        for (let i = 0; i < p.length; ++i) {
          p[i].trim();
        }
        setPlayers(p.filter(elem => elem.trim() !== ""));
    }

    const handleWinChange = (e) => {
        setWin(e.target.value)
    }

    const handleTieChange = (e) => {
        setTie(e.target.value)
    }

    const handleLossChange = (e) => {
        setLoss(e.target.value)
    }

    return(
        <>
        <div className="buttons-div">
            { !isAuthenticated ?
                <button id="login-button" onClick={() => loginWithRedirect()}>
                    Prijava
                </button> : 
                <button id="logout-button" onClick={() => logout()}>
                    Odjava
                </button>
            }
        </div>
            {
                isAuthenticated ?
                    <div className="logged-user-input">
                        <form>
                            <div className='form-div'>
                                <label>Naziv natjecanja</label>
                                <input type="text" id="name-input" onChange={handleNameChange}></input>
                            </div>
                            <div className='form-div'>
                                <label>Imena 4-8 natjecatelja (nakon svakog novi redak) </label>
                                <textarea type="text" id="players-input" onChange={handlePlayersChange}></textarea>
                            </div>
                            <div className='form-div'>
                                <label>Sustav natjecanja (pobjeda / remi / poraz)</label>
                                <input type='text' id='system-input' onChange={handleWinChange}></input> / 
                                <input type='text' id='system-input' onChange={handleTieChange}></input> / 
                                <input type='text' id='system-input' onChange={handleLossChange}></input>
                            </div>
                            {
                            nameError && <div className='error'>Morate unijeti ime natjecanja.</div>
                        }
                            {
                            formatError && <div className='error'>Pogrešan unos formata, unesite brojeve.</div>
                        }
                        {
                            playersError && <div className='error'>Broj natjecatelja mora biti između 4 i 8.</div>
                        }
                        <div id="confirm-div"><button id="confirm-button" type="submit" onClick={handleUserInput}>Unesi</button></div>
                        </form> 
                    </div>
                : ""
            }
            <div className='all-tours'>
              <div className='all-tours-title'>SVA DOSTUPNA NATJECANJA:</div>
              <div>
                {
                  tournaments.map((element, index) => (
                    <div className="all-tours-lines" key={index}> • <Link to={`/tour/?id=${element.id}`}>{element.naziv}</Link></div>
                  ))
                }
              </div>
            </div>
        </>
    )

}

export default Body;