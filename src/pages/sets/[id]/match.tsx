import { Box } from "@chakra-ui/react";
import React from "react";
import { create, createStore } from "zustand";
import type { ComponentWithAuth } from "../../../components/auth-component";
import { MatchCard } from "../../../components/match-card";
import { CreateMatchData } from "../../../modules/create-match-data";
import { HydrateSetData } from "../../../modules/hydrate-set-data";
import { useMatchContext } from "../../../stores/use-match-store";
import { areRectanglesOverlapping } from "../../../utils/match";

const Match: ComponentWithAuth = () => {

    return (
        <HydrateSetData>
            <CreateMatchData>
                <MatchContainer />
            </CreateMatchData>
        </HydrateSetData>
    )
}

interface MatchItem {
    id: string;
    completed: boolean;
    width: number;
    height: number;
    type: "word" | "definition";
    word: string
    y: number,
    x: number
    color?: 'green.400' | 'red.400'
}

export interface MatchStore {
    terms: MatchItem[],
    setCard(index: number, newt: MatchItem): void
    getIndexesUnder: (index: number) => number[]
    validateUnderIndexes(index: number): void
}

const MatchContainer = () => {
    const terms = useMatchContext((state) => state.roundQuestions);

    let r = create<MatchStore>((set, get) => {
        let ter: MatchItem[] = terms.flatMap(term => {
            let base = { id: term.id, completed: false, width: 200, height: 60, x: 0, y: 0 }
            return [
                {
                    ...base,
                    type: "word",
                    word: term.word,
                },
                {
                    ...base,
                    type: "definition",
                    word: term.definition,
                }
            ]
        })

        return {
            terms: ter,
            setCard(index: number, newt: MatchItem) {
                set((state) => {
                    return {
                        terms: [...state.terms.slice(0, index), newt, ...state.terms.slice(index + 1)]
                    }
                })
            },
            // This is it's own thing because eventually there might be indication of the drop target
            getIndexesUnder(index: number) {
                let cur = get().terms[index]!
                return get().terms.flatMap((term, i) => {
                    if (i == index) return []
                    if (areRectanglesOverlapping(cur, term)) {
                        return [i]
                    }
                    return []
                })
            },
            validateUnderIndexes(index: number) {
                let target = get().terms[index]!.id
                let targetType = get().terms[index]!.type == "word" ? "definition" : "word"

                let indexes = get().getIndexesUnder(index)
                let correctIndex: number | undefined
                let incorrects: number[] = []
                indexes.forEach(index => {
                    if(get().terms[index]!.id == target && get().terms[index]!.type == targetType) correctIndex = index
                    else incorrects.push(index)
                })

                if (correctIndex) {
                    get().setCard(index,{
                        ...get().terms[index]!,
                        color: "green.400"
                    })
                    get().setCard(correctIndex,{
                        ...get().terms[correctIndex]!,
                        color: "green.400"
                    })
                } else if (incorrects.length > 0) {
                    incorrects.push(index)
                    incorrects.forEach(idx => {
                        get().setCard(idx,{
                            ...get().terms[idx]!,
                            color: "red.400"
                        })
                    })
                }

                indexes.push(index)
                setTimeout(() => {
                    indexes.forEach(index => {
                        get().setCard(index,{
                            ...get().terms[index]!,
                            color: false
                        })
                    })
                }, 500)
            }
        }
    })

    return (<Box w="100%" h="calc(100vh - 112px)" position="relative">
        {Array.from({ length: r.getState().terms.length }, (_, index) =>
            <MatchCard index={index} subscribe={r} />)
        }
    </Box>)
}

Match.authenticationEnabled = true

export default Match