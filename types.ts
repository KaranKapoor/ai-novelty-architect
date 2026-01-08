export interface Idea {
  id: string;
  title: string;
  domain: string;
  visualPrompt: string; // The prompt used to generate the image
  summary: {
    novelty: string;
    description: string;
    priorArtDifference: string;
    implementation: string;
  };
  imageUrl?: string; // Populated after image generation
  loadingImage?: boolean;
}

export interface UserProfile {
  bio: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  bio: `I am a seasoned engineer and architect with over 19 years of experience driving large-scale software architecture and enterprise solutions. I have proven expertise in leading cross-functional and global teams through multiple strategic projects and complex technology transformations.
I am working on a new state of the art licensing platform for my company focused on managing product use of enterprise servers, storage, networking and other data center products using licensing.
I have re-imagined platforms, written several white-papers, filed several patents across software architecture, enterprise licensing and GenAI domains.
I am currently leading & driving delivery excellence within cross-functional teams.`
};