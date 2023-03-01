// Helper for genotype color
export const getColorForGenotype = (genotype) => {
    switch (genotype) {
        case '0':
        case '0.0.1':
        case '0.0.2':
        case '0.0.3':
        case '0.1.0':
        case '0.1':
        case '0.1.1':
        case '0.1.2':
        case '0.1.3':
            return "#808080";
        case '1.1':
        case '1.1.1':
        case '1.1.2':
        case '1.1.3':
        case '1.1.4':
            return "#ffff00";
        case '1.2':
        case '1.2.1':
            return "#ffd700";
        case '2':
        case '2.0.0':
        case '2.0.1':
        case '2.0.2':
            return "#32cd32";
        case '2.1.0':
        case '2.1':
        case '2.1.1':
        case '2.1.2':
        case '2.1.3':
        case '2.1.4':
        case '2.1.5':
        case '2.1.6':
        case '2.1.7':
        case '2.1.8':
        case '2.1.9':
        case '2.1.7.1':
        case '2.1.7.2':
            return "#adff2f";
        case '2.2':
        case '2.2.0':
        case '2.2.1':
        case '2.2.2':
        case '2.2.3':
        case '2.2.4':
            return "#98fb98";
        case '2.3':
        case '2.3.1':
        case '2.3.2':
        case '2.3.3':
        case '2.3.4':
        case '2.3.5':
            return "#6b8e23";
        case '2.4.0':
        case '2.4':
        case '2.4.1':
            return "#2e8b57";
        case '2.5.0':
        case '2.5':
        case '2.5.1':
        case '2.5.2':
            return "#006400";
        case '3.0.0':
        case '3':
        case '3.0.1':
        case '3.0.2':
            return "#0000cd";
        case '3.1.0':
        case '3.1':
        case '3.1.1':
        case '3.1.2':
            return "#4682b4";
        case '3.2.1':
        case '3.2':
        case '3.2.2':
            return "#00bfff";
        case '3.3.0':
        case '3.3':
        case '3.3.1':
        case '3.3.2':
        case '3.3.2.Bd1':
        case '3.3.2.Bd2':
            return "#1e90ff";
        case '3.4':
            return "#6a5acd";
        case '3.5':
        case '3.5.1':
        case '3.5.2':
        case '3.5.3':
        case '3.5.4':
        case '3.5.4.1':
        case '3.5.4.2':
        case '3.5.4.3':
            return "#4b0082";
        case '4':
        case '4.1.0':
        case '4.1':
        case '4.1.1':
            return "#8b0000";
        case '4.2':
        case '4.2.1':
        case '4.2.2':
        case '4.2.3':
            return "#ff6347";
            // case '4.3':
            // case '4.3.0':
        case '4.3.1':
            return "#ff0000";
        case '4.3.1.1':
        case '4.3.1.1.EA1':
            return '#f1b6da';
        case '4.3.1.1.P1':
            return "black";
        case '4.3.1.2':
        case '4.3.1.2.EA2':
        case '4.3.1.2.EA3':
        case '4.3.1.2.1':
        case '4.3.1.2.1.1':
            return "#c51b7d";
        case '4.3.1.3':
        case '4.3.1.3.Bdq':
            return "#fb8072";
        default:
            return "#F5F4F6";
    }
}

export const getColorForAMR = (amr) => {
    switch (amr) {
        case 'No AMR detected':
            return "#addd8e";
        case 'MDR_DCS':
            return "#9e9ac8"
        case 'MDR':
            return "red"
        case 'DCS':
            return "#6baed6"
        case 'AzithR_MDR':
            return "#a50f15"
        case 'AzithR_DCS':
            return "#7a0177"
        case 'AzithR_DCS_MDR':
            return "#54278f"
        case 'XDR':
            return "black"
        case 'AMR':
            return "#ffeda0"
        case 'AMR_DCS':
            return "#fd8d3c";
        default:
            return "#F5F4F6";
    }
}

export const getColorForSimpleGenotype = (genotype) => {
    switch (genotype) {
        case 'H58':
            return "green";
        case 'Non-H58':
            return "red";
        default:
            return "#F5F4F6";
    }
}

export const getColorForDrug = (drug) => {
    switch (drug) {
        case 'Azithromycin':
            return "rgb(144,211,199)";
        case 'Fluoroquinolones (CipI/R)':
            return "rgb(255,236,120)";
        case 'ESBL':
            return "#DB90F0";
        case 'Chloramphenicol':
            return "rgb(249,129,117)";
        case 'Ampicillin':
            return "rgb(129,178,210)";
        case 'Co-trimoxazole':
            return "rgb(252,180,105)";
        case 'Sulphonamides':
            return "rgb(180,221,112)";
        case 'Trimethoprim':
            return "rgb(102,102,255)";
        case 'Tetracyclines':
            return "rgb(251,207,229)";
        case 'Susceptible':
            return "lightGray";
        case 'Fluoroquinolones (CipI)':
            return "#98fb98";
        case 'Fluoroquinolones (CipR)':
            return "#9e9ac8";
        default:
            return "#F5F4F6";
    }
}

export const getColorForIncType = (incType) => {
    switch (incType) {
        case 'IncX1':
            return 'rgb(174,227,154)'
        case 'IncFIA(HI1)':
            return 'rgb(138,35,139)'
        case 'IncFIB(pHCM2)':
            return 'rgb(163,215,30)'
        case 'IncA/C2':
            return 'rgb(69,51,214)'
        case 'IncP1':
            return 'rgb(223,207,231)'
        case 'IncFIA(HI1)/IncHI1A/IncHI1B(R27)':
            return 'rgb(66,69,94)'
        case 'Col(BS512)':
            return 'rgb(251,172,246)'
        case 'IncHI1A/IncHI1B(R27)':
            return 'rgb(34,151,67)'
        case 'IncN':
            return 'rgb(238,83,190)'
        case 'IncHI1B(R27)':
            return 'rgb(68,242,112)'
        case 'p0111':
            return 'rgb(251,45,76)'
        case 'IncHI1A':
            return 'rgb(101,230,249)'
        case 'IncI1':
            return 'rgb(123,44,49)'
        case 'IncY':
            return 'rgb(231,173,121)'
        case 'IncFIB(AP001918)':
            return 'rgb(32,80,46)'
        case 'IncFIB(K)':
            return 'rgb(53,136,209)'
        case 'IncHI2/IncHI2A':
            return 'rgb(115,140,78)'
        case 'Col440I':
            return 'rgb(159,4,252)'
        case 'Col156':
            return 'rgb(244,212,3)'
        case 'Col440II/Col440II':
            return 'rgb(17,160,170)'
        case 'IncFIA(HI1)/IncHI1A':
            return 'rgb(251,120,16)'
        case 'ColRNAI':
            return 'rgb(91,67,11)'
        case 'ColpVC':
            return 'rgb(248,117,116)'
        case 'IncX3':
            return 'rgb(190,177,231)'
        default:
            return "#F5F4F6";
    }
}

export const getColorForTetracyclines = (tetA) => {
    switch (tetA) {
        case 'tetA(A)':
            return 'rgb(174,227,154)'
        case 'tetA(B)':
            return '#D7AEF7'
        case 'tetA(C)':
            return '#FFEC78'
        case 'tetA(D)':
            return '#FCB469'
        case 'tetA(AB)':
            return 'rgb(223,207,231)'
        case 'tetA(ABC)':
            return 'rgb(66,69,94)'
        case 'tetA(ABD)':
            return 'rgb(251,172,246)'
        case 'tetA(ABCD)':
            return 'rgb(34,151,67)'
        case 'tetA(AC)':
            return 'rgb(238,83,190)'
        case 'tetA(ACD)':
            return 'rgb(68,242,112)'
        case 'tetA(AD)':
            return 'rgb(251,45,76)'
        case 'tetA(BC)':
            return 'rgb(101,230,249)'
        case 'tetA(BD)':
            return 'rgb(123,44,49)'
        case 'tetA(BCD)':
            return 'rgb(231,173,121)'
        case 'tetA(CD)':
            return 'rgb(32,80,46)'
        default:
            return "#F5F4F6";
    }
}