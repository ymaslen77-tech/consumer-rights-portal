import { getSeoGuide, SeoGuidePage, seoGuideMetadata } from "@/components/SeoGuide";
const guide=getSeoGuide("consumer-complaint");
export function generateMetadata(){return seoGuideMetadata(guide)}
export default function Page(){return <SeoGuidePage guide={guide}/>}
