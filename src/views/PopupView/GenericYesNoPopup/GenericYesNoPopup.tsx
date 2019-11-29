import React, { useEffect, useState } from "react";
import "./GenericYesNoPopup.scss";
import { TextButton } from "../../Common/TextButton/TextButton";
import { ContextManager } from "../../../logic/context/ContextManager";
import { ContextType } from "../../../data/enums/ContextType";

interface IProps {
  title: string;
  renderContent: () => any;
  acceptLabel: string;
  onAccept: () => any;
  skipAcceptButton?: boolean;
  disableAcceptButton?: boolean;
  rejectLabel: string;
  onReject: () => any;
  skipRejectButton?: boolean;
  disableRejectButton?: boolean;
  onClickUpload?: () => any;
  isUpload?: boolean;
  onClickBack?: () => any;
}

export const GenericYesNoPopup: React.FC<IProps> = ({
  title,
  renderContent,
  acceptLabel,
  onAccept,
  skipAcceptButton,
  disableAcceptButton,
  rejectLabel,
  onReject,
  skipRejectButton,
  disableRejectButton,
  onClickUpload,
  isUpload,
  onClickBack
}) => {
  const [status, setMountStatus] = useState(false);
  useEffect(() => {
    if (!status) {
      ContextManager.switchCtx(ContextType.POPUP);
      setMountStatus(true);
    }
  }, [status]);

  const renderNormalFooter = () => {
    return (
      <div className="Footer" >
        <TextButton
          label={"上传图片"}
          onClick={onClickUpload}
          externalClassName={"accept"}
        />
        {!skipRejectButton && (
          <TextButton
            label={!!rejectLabel ? rejectLabel : "不, 谢谢"}
            onClick={onReject}
            externalClassName={"reject"}
            isDisabled={disableRejectButton}
          />
        )
        }
        {
          !skipAcceptButton && (
            <TextButton
              label={!!acceptLabel ? acceptLabel : "好的"}
              onClick={onAccept}
              externalClassName={"accept"}
              isDisabled={disableAcceptButton}
            />
          )
        }
      </div >
    )
  }
  const renderUploadFooter = () => {
    return <div className="Footer" >
      {/* <TextButton
        label={"新建文件夹"}
        onClick={onClickUpload}
        externalClassName={"accept"}
      /> */}
      <TextButton
        label={"返回"}
        onClick={onClickBack}
        externalClassName={"accept"}
      />
    </div>
  }
  return (
    <div className="GenericYesNoPopup">
      <div className="Header">{title}</div>
      <div className="Content">{renderContent()}</div>
      {!isUpload ? renderNormalFooter() : renderUploadFooter()}
    </div>
  );
};
