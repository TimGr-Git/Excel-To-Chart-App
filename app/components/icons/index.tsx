import React from "react";
import { AiOutlineDelete, AiTwotoneEdit } from "react-icons/ai";
import { FiDownload } from "react-icons/fi";
import { IoAddSharp } from "react-icons/io5";

type IconProps = {
  className?: string;
  title?: string;
  "aria-label"?: string;
};

export const DeleteIcon: React.FC<IconProps> = ({
  className,
  title,
  ...rest
}) => <AiOutlineDelete className={className} aria-label={title} {...rest} />;

export const EditIcon: React.FC<IconProps> = ({
  className,
  title,
  ...rest
}) => <AiTwotoneEdit className={className} aria-label={title} {...rest} />;

export const DownloadIcon: React.FC<IconProps> = ({
  className,
  title,
  ...rest
}) => <FiDownload className={className} aria-label={title} {...rest} />;

export const AddIcon: React.FC<IconProps> = ({ className, title, ...rest }) => (
  <IoAddSharp className={className} aria-label={title} {...rest} />
);

const Icons = {
  DeleteIcon,
  EditIcon,
  DownloadIcon,
  AddIcon,
};

export default Icons;
