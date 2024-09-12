import * as Dialog from '@radix-ui/react-dialog';
import { Dispatch, FC, SetStateAction } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { RxCross2 } from 'react-icons/rx';
import { useTransition, animated } from 'react-spring';

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  selectedCard: number;
  data: any;
  handleMarkerClick: any;
};

const ShelterDialog: FC<Props> = ({
  open,
  setOpen,
  selectedCard,
  data,
  handleMarkerClick,
}) => {
  const transitionsLoginModal = useTransition(open, {
    from: { transform: 'translate(-50%, 100%)' }, // 初期位置: 画面下
    enter: { transform: 'translate(-50%, 0%)' }, // 表示時: 正常な位置
    leave: { transform: 'translate(-50%, 100%)' }, // 非表示時: 画面下に戻る
    config: {
      tension: 200, // バウンドしないために低めに設定
      friction: 20, // 滑らかさを調整
      clamp: true, // アニメーションの終わりでバウンドしないように設定
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger />
      {transitionsLoginModal((styles, item) =>
        (item as any) ? (
          <Dialog.Portal>
            <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
            <Dialog.Content>
              <animated.div
                style={{
                  transform: styles.transform,
                }}
                className="data-[state=open]:animate-contentShow fixed top-[20vh] pb-[100px] left-[50%] h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] rounded-3xl bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
              >
                <div className="flex justify-between items-center mb-1">
                  <Dialog.Title className="text-mauve12 m-0 font-medium text-[#171717]">
                    近くの避難所
                  </Dialog.Title>
                  <Dialog.Close>
                    <RxCross2 size={25} color="#D9D9D9" />
                  </Dialog.Close>
                </div>
                <Dialog.Description />
                <ScrollArea.Root className="relative h-full">
                  <ScrollArea.Viewport className="h-full w-full">
                    <div className="grid grid-cols-3 place-content-center gap-x-1 gap-y-4 mt-3">
                      {data && data.length > 0 ? (
                        data.map((item, index) => {
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                handleMarkerClick(item[0], item[1], index);
                                setOpen(false);
                              }}
                            >
                              <div
                                className={`${selectedCard === index ? 'border-[#009891]' : 'border-[#D9D9D9]'} h-full border rounded-xl p-2`}
                              >
                                <div className="flex gap-2 items-center">
                                  <div className="border-r border-[#009891] h-[35px]"></div>
                                  <h3 className="text-sm text-[#171717]">
                                    {item[2]}
                                  </h3>
                                </div>
                                <p className="text-xs text-[#9A9A9A] mt-1">
                                  {item[3]}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        // データがない場合のプレースホルダー
                        <>
                          {[...Array(3)].map((_, index) => (
                            <div
                              key={index}
                              className="w-full h-[94px] bg-gray-200 animate-pulse rounded-xl"
                            ></div>
                          ))}
                        </>
                      )}
                    </div>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar
                    orientation="horizontal"
                    className="absolute bottom-0 right-0 h-2 w-full"
                  >
                    <ScrollArea.Thumb className="bg-gray-400" />
                  </ScrollArea.Scrollbar>
                  <ScrollArea.Scrollbar
                    orientation="vertical"
                    className="absolute top-0 right-0 w-2 h-full"
                  >
                    <ScrollArea.Thumb className="bg-gray-400" />
                  </ScrollArea.Scrollbar>
                  <ScrollArea.Corner className="bg-gray-400" />
                </ScrollArea.Root>
              </animated.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null
      )}
    </Dialog.Root>
  );
};

export default ShelterDialog;
