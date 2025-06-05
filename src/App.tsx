import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, Frown, Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ImageData = {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
};

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [isError, setIsError] = useState<boolean>(false);
  const [imageDetails, setImageDetails] = useState<ImageData>();
  const [isImageDetailsLoading, setIsImageDetailsLoading] =
    useState<boolean>(true);

  const fetchImages = async ({
    searchTerm = "",
    page = 1,
  }: {
    searchTerm?: string;
    page?: number;
  }) => {
    const pageSize = 20;

    const url = `https://pixabay.com/api/?key=50679890-93132532f792837d6418bc025&per_page=${pageSize}&q=${
      searchTerm || ""
    }&page=${page || 1}&image_type=photo`;

    if (isError) {
      setIsError(false); // Reset error state
    }

    try {
      const response = await axios.get(url);

      if (response?.data?.hits) {
        setImages(response?.data?.hits);
      }
    } catch {
      setIsError(true);
    }
  };

  useEffect(() => {
    //Call the API to fetch images when the component mounts
    fetchImages({});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Debounce the search input to avoid too many API calls
    const handler = setTimeout(() => {
      setPage(1); // Reset page to 1 when search term changes

      //call api with searchTerm
      fetchImages({ searchTerm, page: 1 });
    }, 500);

    return () => {
      clearTimeout(handler);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <>
      <div className="h-screen px-5 max-w-[1024px] mx-auto flex flex-col items-center">
        <h1 className="text-3xl text-center pt-8 text-gray-400">
          <Image className="h-[16px] -ml-[5px]" /> IMAGE GALLERY
        </h1>

        <Input
          className="my-10 min-h-[40px] md:max-w-[400px] border-gray-400 border-2"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isError && (
          <p className="text-red-800 flex gap-3">
            <Frown />
            Something went wrong...
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {images.map((image) => (
            <div
              key={image.id}
              className="w-full h-[250px] md:w-[180px] md:h-[100px] rounded-md overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => {
                setImageDetails(image);
              }}
            >
              <img
                src={image.webformatURL}
                alt={image.tags}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {Boolean(!isError && images.length) && (
            <div className="flex items-center gap-3 mt-5">
              <Button
                disabled={page <= 1}
                title="Previous"
                variant="secondary"
                size="icon"
                className="size-8 cursor-pointer"
                onClick={() => {
                  setPage((prev) => prev - 1);
                  fetchImages({ searchTerm, page: page - 1 });
                }}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                title="Next"
                variant="secondary"
                size="icon"
                className="size-8 cursor-pointer"
                onClick={() => {
                  setPage((prev) => prev + 1);
                  fetchImages({ searchTerm, page: page + 1 });
                }}
              >
                <ChevronRightIcon />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(imageDetails)}
        onOpenChange={() => {
          setIsImageDetailsLoading(true);
          setImageDetails(undefined);
        }}
      >
        <DialogContent className="min-w-[90%] md:min-w-[60%] md:h-[70%] lg:h-[80%]">
          <DialogHeader>
            <DialogTitle className="mb-3">Image Details</DialogTitle>
            <DialogDescription className="mb-5">
              <div className="max-h-[100px] overflow-auto">
                {imageDetails?.tags?.split(",")?.map((tag) => (
                  <span className="bg-gray-200 px-2 py-1 mr-3 mb-2 rounded-md inline-block">
                    {tag}
                  </span>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 overflow-auto">
            {imageDetails?.largeImageURL && (
              <>
                {isImageDetailsLoading && (
                  <p className="absolute top-[50%] text-gray-700 text-sm">
                    loading...
                  </p>
                )}
                <img
                  src={imageDetails.largeImageURL}
                  className="w-full h-full object-contain"
                  onLoad={() => {
                    setIsImageDetailsLoading(false);
                  }}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
