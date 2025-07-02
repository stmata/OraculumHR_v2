import React from "react";
import { useSession } from "../../context/SessionContext";
import IDCardResult from "../Results/IDCardResult/IDCardResult";
import PassportResult from "../Results/PassportResult/PassportResult";
import ResumeResult from "../Results/ResumeResult/ResumeResult";
import DiplomaResult from "../Results/DiplomaResult/DiplomaResult";
import BankResult from "../Results/BankResult/BankResult";
import SocialSecurityResult from "../Results/SocialSecurityResult/SocialSecurityResult";

const ResultCard = ({ data }) => {
  const {
    docType,
  } = useSession();

  let Component;
  switch (docType) {
    case "idcard":
      Component = <IDCardResult data={data} />;
      break;
    case "passport":
      Component = <PassportResult data={data} />;
      break;
    case "resume":
      Component = <ResumeResult data={data} />;
      break;
    case "diploma":
      Component = <DiplomaResult data={data} />;
      break;
    case "bank":
      Component = <BankResult data={data} />;
      break;
    case "social_security":
      Component = <SocialSecurityResult data={data} />;
      break;
    default:
      return null;
  }

  return (
    <>
      <div >
        {Component}
      </div>

    </>
  );
};

export default ResultCard;