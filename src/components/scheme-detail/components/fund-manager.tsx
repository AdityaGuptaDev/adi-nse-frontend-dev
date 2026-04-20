import { FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import UserFundDetails from "./user-fund-details";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { convertManagerDate, dateFormateValue, handleServerError } from "@/utils/helpers";

export default function FundManager({ schemeData }: any) {
  const router = useRouter();

  const [fundManagereData, setFundManagereData] = useState<any>([]);


  const profiles = [
    {
      name: "Sankaran Naren",
      title: "Chief Investment Officer - Equity",
      experience: "21 Year Experience",
      joining: "Date Of Joining 17 Dec 2009",
      education: "B. Tech (IIT-Madras), PGDM (IIM-Calcutta)",
    },
    {
      name: "Rajat Chandak",
      title: "Senior Manager - Investments",
      experience: "5 Year Experience",
      joining: "Date Of Joining 17 Dec 2020",
      education: "B. Com, PGDM(Finance)",
    },
    {
      name: "Sankaran Naren",
      title: "Chief Investment Officer - Equity",
      experience: "21 Year Experience",
      joining: "Date Of Joining 17 Dec 2009",
      education: "B. Tech (IIT-Madras), PGDM (IIM-Calcutta)",
    },
    {
      name: "Sankaran Naren",
      title: "Chief Investment Officer - Equity",
      experience: "21 Year Experience",
      joining: "Date Of Joining 17 Dec 2009",
      education: "B. Tech (IIT-Madras), PGDM (IIM-Calcutta)",
    },
  ];


  useEffect(() => {
    if(schemeData) {
      getFundManagerData();
    }
  }, [schemeData]);

  const getFundManagerData = async () => {
    try {

      let passBody: any = {
        schemeId: schemeData?.id,
        schemeISINNo: schemeData?.schemeISIN
      }

      let res: any = await api.post(`/scheme/get-fundmanager-data`, passBody);

      if (res.data.data) {
        setFundManagereData(res.data.data);
      }

    } catch (error) {
      handleServerError(error);
    }
  }

  const handleUserFundDetailPage = (profile: any) => {

    const benchmarkids = schemeData?.SchemeBenchmarksMappings?.map(
      (item: any) => item.benchmark_id_FK
    );
    // router.push(
    //   `/user-fund-detail?id=${schemeData.id}&isin=${schemeData.schemeISIN}&selectCategory=${schemeData?.categoryid
    //   }&selectSubCategory=${JSON.stringify([
    //     schemeData?.subcategory_id,
    //   ])}&benchmark_id=${JSON.stringify([benchmarkids])}&scheme_type=${schemeData?.scheme_type
    //   }&name=${schemeData?.name}&ms_fullname=${schemeData?.ms_fullname}&fund_manager_id=${profile.scheme_manager_id}`
    // );

      router.push(
      `/user-fund-detail?id=${schemeData.id}&fund_manager_id=${profile.scheme_manager_id}`
    );
  }

  return (
    <div className="p-2 sm:p-6 bg-[#111111] min-h-screen">
      <div className="grid sm:grid-cols-2 gap-5 max-w-full">
        {/* {profiles.map((profile, i) => (
          <div
            key={i}
            className="bg-[#111111] p-6 border border-field-border rounded-sm hover:shadow-sm flex justify-between items-center"
          >
            <div>
              <h3
                className=" text-base-content cursor-pointer"
                onClick={() => handleUserFundDetailPage()}
              >
                {profile.name}
              </h3>
              <p className="text-base-content text-sm ">{profile.title}</p>
              <p className="text-base-content text-sm">{profile.experience}</p>
              <p className="text-base-content text-sm">{profile.joining}</p>
              <p className="text-base-content text-sm">{profile.education}</p>
            </div>
            <div className="text-primary text-sm cursor-pointer" onClick={() => handleUserFundDetailPage()}>
              <FaChevronRight />
            </div>
          </div>
        ))} */}
        {fundManagereData.length > 0 && fundManagereData.map((profile: any, i: any) => (
          <div
            key={i}
            className="bg-[#111111] p-3 sm:p-6 border border-field-border rounded-sm hover:shadow-sm flex justify-between items-center"
          >
            <div>
              <h3
                className=" text-base-content font-semibold cursor-pointer"
                onClick={() => handleUserFundDetailPage(profile)}
              >
                {profile?.FundManagersMaster?.manager_name}
              </h3>
              {/* <p className="text-base-content text-sm ">Chief Investment Officer - Equity</p> */}
              <p className="text-base-content text-sm">{profile?.FundManagersMaster?.manager_exp === 'NULL' || profile?.FundManagersMaster?.manager_exp == null ? 0 : profile?.FundManagersMaster?.manager_exp} Year Experience</p>
              <p className="text-base-content text-sm">Date Of Joining  {profile?.manager_startdate ? convertManagerDate(profile?.manager_startdate) : ''}</p>
              <p className="text-base-content text-sm">{profile?.FundManagersMaster?.manager_education}</p>
            </div>
            <div className="text-primary text-sm cursor-pointer" onClick={() => handleUserFundDetailPage(profile)}>
              <FaChevronRight />
            </div>
          </div>
        ))}
      </div>
      <div></div>
    </div>
  );
}
